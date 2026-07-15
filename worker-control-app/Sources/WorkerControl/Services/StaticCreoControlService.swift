import Foundation

actor StaticCreoControlService {
    private let runner = CommandRunner()
    private let fileManager = FileManager.default

    private var runtimeRoot: URL {
        fileManager.homeDirectoryForCurrentUser
            .appending(path: "Library/Application Support/StaticCreo/cloud-worker", directoryHint: .isDirectory)
    }

    private var scriptURL: URL { runtimeRoot.appending(path: "scripts/staticcreo-worker-control.mjs") }
    private var environmentURL: URL { runtimeRoot.appending(path: ".env.server.local") }

    func status() async throws -> StaticCreoControlSnapshot {
        try await run(action: "status")
    }

    func purgeCache() async throws -> StaticCreoControlSnapshot {
        try await run(action: "purge-cache")
    }

    func updateProfile(_ lane: StaticCreoLane, model: String, enabled: Bool, maxConcurrency: Int, timeoutSeconds: Int) async throws {
        _ = try await run(action: "update-profile", arguments: [
            "--slug", lane.slug,
            "--model", model,
            "--enabled", enabled ? "true" : "false",
            "--max-concurrency", String(maxConcurrency),
            "--timeout-seconds", String(timeoutSeconds),
        ])
    }

    private func run(action: String, arguments: [String] = []) async throws -> StaticCreoControlSnapshot {
        guard fileManager.fileExists(atPath: scriptURL.path) else {
            throw StaticCreoControlError.runtimeUnavailable
        }
        guard let node = nodeExecutable() else { throw StaticCreoControlError.nodeUnavailable }

        let result = try await runner.run(
            node,
            arguments: [
                "--env-file-if-exists=\(environmentURL.path)",
                scriptURL.path,
                "--action", action,
            ] + arguments,
            environment: ["STATICCREO_PROJECT_ROOT": runtimeRoot.path],
            allowFailure: true
        )
        let candidate = result.standardOutput
            .split(separator: "\n")
            .last
            .map(String.init) ?? ""
        guard let data = candidate.data(using: .utf8),
              let response = try? JSONDecoder().decode(StaticCreoControlSnapshot.self, from: data)
        else {
            throw StaticCreoControlError.invalidResponse(result.standardError)
        }
        if !response.ok {
            throw StaticCreoControlError.remote(response.error ?? result.standardError)
        }
        return response
    }

    private func nodeExecutable() -> String? {
        ["/opt/homebrew/bin/node", "/usr/local/bin/node", "/usr/bin/node"]
            .first { fileManager.isExecutableFile(atPath: $0) }
    }
}

enum StaticCreoControlError: LocalizedError {
    case runtimeUnavailable
    case nodeUnavailable
    case invalidResponse(String)
    case remote(String)

    var errorDescription: String? {
        switch self {
        case .runtimeUnavailable: "StaticCreo control runtime не установлен"
        case .nodeUnavailable: "Node.js не найден на внутреннем диске"
        case .invalidResponse(let message): message.isEmpty ? "StaticCreo вернул неизвестный ответ" : message
        case .remote(let message): message
        }
    }
}
