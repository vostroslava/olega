import AppKit
import SwiftUI

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}

@main
struct WorkerControlApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var store = WorkerStore()

    var body: some Scene {
        WindowGroup("Worker Control", id: "main") {
            ContentView(store: store)
                .frame(minWidth: 940, minHeight: 640)
        }
        .defaultSize(width: 1120, height: 760)
        .commands {
            CommandGroup(after: .sidebar) {
                Button("Обновить статусы") {
                    Task { await store.refresh() }
                }
                .keyboardShortcut("r", modifiers: [.command])
            }
        }

        MenuBarExtra {
            MenuBarView(store: store)
        } label: {
            Label("Worker Control", systemImage: store.overallHealth.systemImage)
        }

        Settings {
            SettingsView()
        }
    }
}
