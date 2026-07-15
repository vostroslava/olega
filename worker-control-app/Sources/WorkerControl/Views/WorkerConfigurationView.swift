import SwiftUI

struct WorkerConfigurationView: View {
    @Bindable var store: WorkerStore
    let worker: WorkerDefinition
    let status: WorkerRuntimeStatus

    @State private var draft: [String: String] = [:]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Настройки воркера")
                        .font(.title2.weight(.semibold))
                    Text("После сохранения запущенный LaunchAgent будет аккуратно перезагружен.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button("По умолчанию") {
                    draft = Dictionary(uniqueKeysWithValues: worker.settings.map { ($0.environmentKey, $0.displayValue(from: $0.defaultValue)) })
                }
                .disabled(store.busyWorkers.contains(worker.id))
                Button("Сохранить") {
                    Task { await store.saveSettings(draft, for: worker) }
                }
                .buttonStyle(.borderedProminent)
                .disabled(store.busyWorkers.contains(worker.id) || !status.installed || !hasChanges)
            }

            ForEach(visibleCategories) { category in
                VStack(alignment: .leading, spacing: 0) {
                    Label(category.title, systemImage: category.systemImage)
                        .font(.headline)
                        .padding(.bottom, 8)

                    let settings = worker.settings.filter { $0.category == category }
                    VStack(spacing: 0) {
                        ForEach(Array(settings.enumerated()), id: \.element.id) { index, setting in
                            settingRow(setting)
                                .padding(.vertical, 12)
                            if index < settings.count - 1 { Divider() }
                        }
                    }
                    .padding(.horizontal, 16)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                }
            }
        }
        .task(id: worker.id) {
            loadDraft()
        }
    }

    @ViewBuilder
    private func settingRow(_ setting: WorkerSettingDefinition) -> some View {
        HStack(alignment: .center, spacing: 20) {
            VStack(alignment: .leading, spacing: 3) {
                Text(setting.title)
                    .font(.callout.weight(.medium))
                Text(setting.detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()

            switch setting.kind {
            case .choice(let values):
                Picker(setting.title, selection: binding(for: setting)) {
                    ForEach(values, id: \.self) { value in Text(value).tag(value) }
                }
                .labelsHidden()
                .frame(width: 210)
            case .text:
                TextField(setting.title, text: binding(for: setting))
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 230)
            case .integer:
                HStack(spacing: 6) {
                    TextField(setting.title, text: binding(for: setting))
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 120)
                    if let unit = setting.unit {
                        Text(unit).foregroundStyle(.secondary)
                    }
                }
            case .megabytes:
                HStack(spacing: 6) {
                    TextField(setting.title, text: binding(for: setting))
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 90)
                    Text("МБ").foregroundStyle(.secondary)
                }
            }
        }
    }

    private func binding(for setting: WorkerSettingDefinition) -> Binding<String> {
        Binding(
            get: { draft[setting.environmentKey] ?? setting.defaultValue },
            set: { draft[setting.environmentKey] = $0 }
        )
    }

    private func loadDraft() {
        draft = Dictionary(uniqueKeysWithValues: worker.settings.map { setting in
            (setting.environmentKey, setting.displayValue(from: status.environment[setting.environmentKey]))
        })
    }

    private var visibleCategories: [WorkerSettingCategory] {
        WorkerSettingCategory.allCases.filter { category in
            worker.settings.contains { $0.category == category }
        }
    }

    private var hasChanges: Bool {
        worker.settings.contains { setting in
            let current = setting.displayValue(from: status.environment[setting.environmentKey])
            return draft[setting.environmentKey] != current
        }
    }
}
