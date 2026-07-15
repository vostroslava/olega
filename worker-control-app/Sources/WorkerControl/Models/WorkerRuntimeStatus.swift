import Foundation

enum WorkerActivity: String, Sendable {
    case running
    case waiting
    case stopped
    case unknown
}

enum WorkerHealth: String, Sendable {
    case healthy
    case attention
    case stopped
    case unavailable

    var title: String {
        switch self {
        case .healthy: "Работает"
        case .attention: "Нужно внимание"
        case .stopped: "Выключен"
        case .unavailable: "Не установлен"
        }
    }

    var systemImage: String {
        switch self {
        case .healthy: "checkmark.circle.fill"
        case .attention: "exclamationmark.triangle.fill"
        case .stopped: "pause.circle.fill"
        case .unavailable: "questionmark.circle.fill"
        }
    }
}

struct WorkerRuntimeStatus: Equatable, Sendable {
    var installed = false
    var loaded = false
    var enabled = false
    var activity: WorkerActivity = .unknown
    var pid: Int?
    var lastExitCode: Int?
    var environment: [String: String] = [:]
    var standardLog = ""
    var errorLog = ""
    var errorLogUpdatedAt: Date?
    var remoteOnline: Bool?
    var checkedAt = Date()
    var diagnostic: String?

    var health: WorkerHealth {
        guard installed else { return .unavailable }
        guard enabled, loaded else { return .stopped }
        guard activity == .running else { return .attention }
        if remoteOnline == false { return .attention }
        if let errorLogUpdatedAt, Date().timeIntervalSince(errorLogUpdatedAt) < 300, !errorLog.isEmpty {
            return .attention
        }
        return .healthy
    }

    var pidText: String { pid.map(String.init) ?? "—" }
    var exitCodeText: String { lastExitCode.map(String.init) ?? "—" }

    static let loading = WorkerRuntimeStatus()
}

enum WorkerAction: Sendable {
    case start
    case stop
    case restart
}
