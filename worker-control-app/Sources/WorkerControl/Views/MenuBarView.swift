import AppKit
import SwiftUI

struct MenuBarView: View {
    @Bindable var store: WorkerStore
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        ForEach(store.workers) { worker in
            let status = store.status(for: worker)
            Section(worker.name) {
                Label(status.health.title, systemImage: status.health.systemImage)
                Button(status.loaded ? "Перезапустить" : "Включить") {
                    Task { await store.perform(status.loaded ? .restart : .start, on: worker) }
                }
                if status.loaded || status.enabled {
                    Button("Выключить") {
                        Task { await store.perform(.stop, on: worker) }
                    }
                }
            }
        }

        Divider()
        Button("Открыть центр") {
            openWindow(id: "main")
            NSApp.activate(ignoringOtherApps: true)
        }
        Button("Обновить") {
            Task { await store.refresh() }
        }
        Divider()
        Button("Завершить Worker Control") {
            NSApplication.shared.terminate(nil)
        }
    }
}
