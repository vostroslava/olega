import Foundation

enum LaunchdParser {
    struct Snapshot: Equatable, Sendable {
        var activity: WorkerActivity = .unknown
        var pid: Int?
        var lastExitCode: Int?
    }

    static func snapshot(from output: String) -> Snapshot {
        var snapshot = Snapshot()

        for rawLine in output.split(separator: "\n", omittingEmptySubsequences: false) {
            let line = rawLine.trimmingCharacters(in: .whitespaces)
            if snapshot.activity == .unknown, line.hasPrefix("state = ") {
                let value = String(line.dropFirst("state = ".count))
                snapshot.activity = switch value {
                case "running": .running
                case "waiting": .waiting
                case "stopped", "exited": .stopped
                default: .unknown
                }
            } else if snapshot.pid == nil, line.hasPrefix("pid = ") {
                snapshot.pid = Int(line.dropFirst("pid = ".count))
            } else if snapshot.lastExitCode == nil, line.hasPrefix("last exit code = ") {
                let value = line.dropFirst("last exit code = ".count)
                snapshot.lastExitCode = Int(value)
            }
        }

        return snapshot
    }

    static func isDisabled(label: String, in output: String) -> Bool {
        output.contains("\"\(label)\" => true")
            || output.contains("\"\(label)\" => disabled")
    }
}
