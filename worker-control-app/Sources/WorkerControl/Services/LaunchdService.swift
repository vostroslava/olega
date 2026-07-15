import Foundation

actor LaunchdService {
    private let runner = CommandRunner()
    private let launchctl = "/bin/launchctl"
    private let fileManager = FileManager.default
    private let userID = getuid()

    private var domain: String { "gui/\(userID)" }

    func status(for worker: WorkerDefinition) async -> WorkerRuntimeStatus {
        let installed = fileManager.fileExists(atPath: worker.plistURL.path)
        guard installed else {
            return WorkerRuntimeStatus(installed: false, checkedAt: Date(), diagnostic: "LaunchAgent plist не найден")
        }

        let target = "\(domain)/\(worker.label)"
        let printResult = try? await runner.run(launchctl, arguments: ["print", target], allowFailure: true)
        let disabledResult = try? await runner.run(launchctl, arguments: ["print-disabled", domain], allowFailure: true)
        let loaded = printResult?.exitCode == 0
        let snapshot = loaded ? LaunchdParser.snapshot(from: printResult?.standardOutput ?? "") : .init(activity: .stopped)
        let disabled = LaunchdParser.isDisabled(label: worker.label, in: disabledResult?.standardOutput ?? "")
        let environment = (try? plistEnvironment(at: worker.plistURL)) ?? [:]
        let standardLog = (try? tail(of: worker.standardLogURL)) ?? ""
        let errorLog = (try? tail(of: worker.errorLogURL)) ?? ""
        let errorDate = modificationDate(of: worker.errorLogURL)
        let remoteOnline = await remoteHealth(worker.healthURL)

        return WorkerRuntimeStatus(
            installed: true,
            loaded: loaded,
            enabled: !disabled,
            activity: snapshot.activity,
            pid: snapshot.pid,
            lastExitCode: snapshot.lastExitCode,
            environment: environment,
            standardLog: standardLog,
            errorLog: errorLog,
            errorLogUpdatedAt: errorDate,
            remoteOnline: remoteOnline,
            checkedAt: Date(),
            diagnostic: printResult?.exitCode == 0 ? nil : compact(printResult?.standardError)
        )
    }

    func perform(_ action: WorkerAction, for worker: WorkerDefinition) async throws {
        guard fileManager.fileExists(atPath: worker.plistURL.path) else {
            throw WorkerControlError.plistMissing(worker.plistURL.path)
        }

        let target = "\(domain)/\(worker.label)"
        switch action {
        case .start:
            _ = try await runner.run(launchctl, arguments: ["enable", target])
            let existing = try await runner.run(launchctl, arguments: ["print", target], allowFailure: true)
            if existing.exitCode != 0 {
                _ = try await runner.run(launchctl, arguments: ["bootstrap", domain, worker.plistURL.path])
            }
            _ = try await runner.run(launchctl, arguments: ["kickstart", "-k", target])

        case .stop:
            _ = try await runner.run(launchctl, arguments: ["disable", target])
            _ = try await runner.run(launchctl, arguments: ["bootout", domain, worker.plistURL.path], allowFailure: true)

        case .restart:
            let existing = try await runner.run(launchctl, arguments: ["print", target], allowFailure: true)
            if existing.exitCode == 0 {
                _ = try await runner.run(launchctl, arguments: ["kickstart", "-k", target])
            } else {
                _ = try await runner.run(launchctl, arguments: ["enable", target])
                _ = try await runner.run(launchctl, arguments: ["bootstrap", domain, worker.plistURL.path])
            }
        }
    }

    func updateEnvironment(_ values: [String: String], for worker: WorkerDefinition) async throws {
        let allowed = Set(worker.settings.map(\.environmentKey))
        guard Set(values.keys).isSubset(of: allowed) else {
            throw WorkerControlError.unsupportedSetting
        }

        let target = "\(domain)/\(worker.label)"
        let current = try await runner.run(launchctl, arguments: ["print", target], allowFailure: true)
        let disabled = try await runner.run(launchctl, arguments: ["print-disabled", domain], allowFailure: true)
        let wasLoaded = current.exitCode == 0
        let wasEnabled = !LaunchdParser.isDisabled(label: worker.label, in: disabled.standardOutput)

        try writeEnvironment(values, to: worker.plistURL)

        if wasLoaded {
            _ = try await runner.run(launchctl, arguments: ["bootout", domain, worker.plistURL.path], allowFailure: true)
        }
        if wasEnabled {
            _ = try await runner.run(launchctl, arguments: ["enable", target])
            _ = try await runner.run(launchctl, arguments: ["bootstrap", domain, worker.plistURL.path])
        }
    }

    private func plistEnvironment(at url: URL) throws -> [String: String] {
        let data = try Data(contentsOf: url)
        let object = try PropertyListSerialization.propertyList(from: data, format: nil)
        guard let plist = object as? [String: Any], let values = plist["EnvironmentVariables"] as? [String: Any] else {
            return [:]
        }
        return values.reduce(into: [:]) { result, item in
            result[item.key] = String(describing: item.value)
        }
    }

    private func writeEnvironment(_ values: [String: String], to url: URL) throws {
        let data = try Data(contentsOf: url)
        let object = try PropertyListSerialization.propertyList(from: data, format: nil)
        guard var plist = object as? [String: Any] else { throw WorkerControlError.invalidPlist }
        var environment = plist["EnvironmentVariables"] as? [String: Any] ?? [:]
        for (key, value) in values { environment[key] = value }
        plist["EnvironmentVariables"] = environment

        let output = try PropertyListSerialization.data(fromPropertyList: plist, format: .xml, options: 0)
        try output.write(to: url, options: .atomic)
        try fileManager.setAttributes([.posixPermissions: 0o600], ofItemAtPath: url.path)
    }

    private func tail(of url: URL, byteLimit: UInt64 = 24_000, lineLimit: Int = 100) throws -> String {
        guard fileManager.fileExists(atPath: url.path) else { return "" }
        let handle = try FileHandle(forReadingFrom: url)
        defer { try? handle.close() }
        let size = try handle.seekToEnd()
        try handle.seek(toOffset: size > byteLimit ? size - byteLimit : 0)
        let data = try handle.readToEnd() ?? Data()
        let lines = String(decoding: data, as: UTF8.self).split(separator: "\n", omittingEmptySubsequences: false)
        return lines.suffix(lineLimit).joined(separator: "\n")
    }

    private func modificationDate(of url: URL) -> Date? {
        let attributes = try? fileManager.attributesOfItem(atPath: url.path)
        return attributes?[.modificationDate] as? Date
    }

    private func remoteHealth(_ url: URL?) async -> Bool? {
        guard let url else { return nil }
        do {
            var request = URLRequest(url: url)
            request.timeoutInterval = 5
            request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200,
                  let object = try JSONSerialization.jsonObject(with: data) as? [String: Any]
            else { return false }
            return object["workerOnline"] as? Bool
        } catch {
            return false
        }
    }

    private func compact(_ value: String?) -> String? {
        let text = value?.split(whereSeparator: \.isWhitespace).joined(separator: " ") ?? ""
        return text.isEmpty ? nil : String(text.prefix(300))
    }
}

enum WorkerControlError: LocalizedError {
    case plistMissing(String)
    case invalidPlist
    case unsupportedSetting

    var errorDescription: String? {
        switch self {
        case .plistMissing(let path): "LaunchAgent не найден: \(path)"
        case .invalidPlist: "LaunchAgent plist повреждён или имеет неизвестный формат"
        case .unsupportedSetting: "Попытка изменить параметр, которого нет в разрешённом списке"
        }
    }
}
