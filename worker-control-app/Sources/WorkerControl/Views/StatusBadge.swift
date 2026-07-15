import SwiftUI

struct StatusBadge: View {
    let health: WorkerHealth

    var body: some View {
        Label(health.title, systemImage: health.systemImage)
            .font(.callout.weight(.semibold))
            .foregroundStyle(health.tint)
            .padding(.horizontal, 11)
            .padding(.vertical, 7)
            .background(health.tint.opacity(0.12), in: Capsule())
    }
}
