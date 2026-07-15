import SwiftUI

struct ContentView: View {
    @Bindable var store: WorkerStore

    var body: some View {
        NavigationSplitView {
            WorkerSidebar(store: store)
                .navigationSplitViewColumnWidth(min: 230, ideal: 260, max: 320)
        } detail: {
            if let worker = store.selectedWorker {
                WorkerDetailView(store: store, worker: worker)
                    .id(worker.id)
            } else {
                ContentUnavailableView("Выберите воркер", systemImage: "cpu")
            }
        }
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                Button {
                    Task { await store.refresh() }
                } label: {
                    Label("Обновить", systemImage: "arrow.clockwise")
                }
                .disabled(store.isRefreshing)

                SettingsLink {
                    Label("Настройки приложения", systemImage: "gearshape")
                }
            }
        }
        .task {
            await store.runRefreshLoop()
        }
    }
}
