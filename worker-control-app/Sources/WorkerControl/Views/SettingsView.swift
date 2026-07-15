import SwiftUI

struct SettingsView: View {
    @AppStorage("refreshInterval") private var refreshInterval = 4.0
    @AppStorage("confirmBeforeStop") private var confirmBeforeStop = true

    var body: some View {
        TabView {
            Form {
                Picker("Обновлять статусы", selection: $refreshInterval) {
                    Text("каждые 2 секунды").tag(2.0)
                    Text("каждые 4 секунды").tag(4.0)
                    Text("каждые 10 секунд").tag(10.0)
                }
                Toggle("Спрашивать перед выключением", isOn: $confirmBeforeStop)

                LabeledContent("Управление") {
                    Text("Только пользовательские LaunchAgent")
                        .foregroundStyle(.secondary)
                }
            }
            .formStyle(.grouped)
            .tabItem { Label("Основные", systemImage: "gearshape") }
        }
        .frame(width: 520, height: 260)
        .scenePadding()
    }
}
