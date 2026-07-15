import SwiftUI

struct WorkerSidebar: View {
    @Bindable var store: WorkerStore

    private var selection: Binding<WorkerID?> {
        Binding(
            get: { store.selection },
            set: { if let value = $0 { store.selection = value } }
        )
    }

    var body: some View {
        List(selection: selection) {
            Section("Воркеры") {
                ForEach(store.workers) { worker in
                    let status = store.status(for: worker)
                    HStack(spacing: 10) {
                        Image(systemName: worker.systemImage)
                            .foregroundStyle(.secondary)
                            .frame(width: 18)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(worker.name)
                                .lineLimit(1)
                            Text(status.health.title)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                        }

                        Spacer(minLength: 8)

                        Circle()
                            .fill(status.health.tint)
                            .frame(width: 8, height: 8)
                    }
                    .tag(worker.id)
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Worker Control")
    }
}
