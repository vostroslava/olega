import SwiftUI

extension WorkerHealth {
    var tint: Color {
        switch self {
        case .healthy: .green
        case .attention: .orange
        case .stopped: .secondary
        case .unavailable: .red
        }
    }
}

enum WorkerPresentation {
    static func relativeDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}
