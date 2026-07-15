import SwiftUI

struct StaticCreoControlView: View {
    @Bindable var store: WorkerStore
    let runtimeStatus: WorkerRuntimeStatus

    @State private var confirmCachePurge = false

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("StaticCreo Control Plane")
                        .font(.title2.weight(.semibold))
                    Text("Очереди, AI-профили, heartbeat и временные файлы из реального backend.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if store.isStaticCreoControlBusy { ProgressView().controlSize(.small) }
            }

            if let error = store.staticCreoControlError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .foregroundStyle(.orange)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
            }

            if let snapshot = store.staticCreoControl {
                heartbeatAndCache(snapshot)

                VStack(alignment: .leading, spacing: 12) {
                    Text("AI-исполнители")
                        .font(.headline)
                    ForEach(snapshot.lanes ?? []) { lane in
                        StaticCreoLaneEditor(store: store, lane: lane)
                    }
                }
            } else if store.staticCreoControlError == nil {
                ProgressView("Читаю состояние StaticCreo…")
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .confirmationDialog(
            "Очистить временный кэш StaticCreo?",
            isPresented: $confirmCachePurge,
            titleVisibility: .visible
        ) {
            Button("Очистить staging и assets", role: .destructive) {
                Task { await store.purgeStaticCreoCache() }
            }
            Button("Отмена", role: .cancel) {}
        } message: {
            Text("Исходники и готовые данные в Supabase не удаляются. Воркеры должны оставаться выключенными.")
        }
    }

    private func heartbeatAndCache(_ snapshot: StaticCreoControlSnapshot) -> some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 9) {
                Label("Связь с очередью", systemImage: "wave.3.right.circle")
                    .font(.headline)
                LabeledContent("Backend", value: snapshot.database == "connected" ? "Подключён" : "Не настроен")
                LabeledContent("Последний heartbeat", value: heartbeatText(snapshot.worker?.lastSeenAt))
                LabeledContent("Текущая задача", value: snapshot.worker?.currentTaskKind ?? "нет")
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))

            VStack(alignment: .leading, spacing: 9) {
                Label("Временный кэш", systemImage: "internaldrive")
                    .font(.headline)
                let used = snapshot.runtime?.cacheBytes ?? 0
                let limit = max(1, snapshot.runtime?.cacheLimitBytes ?? 1)
                ProgressView(value: Double(used), total: Double(limit))
                Text("\(ByteCountFormatter.string(fromByteCount: used, countStyle: .file)) из \(ByteCountFormatter.string(fromByteCount: limit, countStyle: .file))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Button("Очистить кэш", role: .destructive) { confirmCachePurge = true }
                    .disabled(runtimeStatus.loaded || store.isStaticCreoControlBusy || used == 0)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func heartbeatText(_ value: String?) -> String {
        guard let value else { return "нет данных" }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let date = formatter.date(from: value) ?? ISO8601DateFormatter().date(from: value)
        guard let date else { return value }
        return WorkerPresentation.relativeDate(date)
    }
}

private struct StaticCreoLaneEditor: View {
    @Bindable var store: WorkerStore
    let lane: StaticCreoLane

    @State private var model: String
    @State private var enabled: Bool
    @State private var concurrency: Int
    @State private var timeout: Int

    init(store: WorkerStore, lane: StaticCreoLane) {
        self.store = store
        self.lane = lane
        _model = State(initialValue: lane.model ?? "codex-default")
        _enabled = State(initialValue: lane.enabled)
        _concurrency = State(initialValue: lane.maxConcurrency)
        _timeout = State(initialValue: lane.timeoutSeconds)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 8) {
                        Image(systemName: laneIcon)
                            .foregroundStyle(.tint)
                        Text(laneTitle)
                            .font(.headline)
                        Text(lane.slug)
                            .font(.caption.monospaced())
                            .foregroundStyle(.secondary)
                    }
                    Text(laneDescription)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Toggle("Включён", isOn: $enabled)
                    .toggleStyle(.switch)
            }

            HStack(spacing: 12) {
                queueMetric("В очереди", lane.queued, color: .secondary)
                queueMetric("Работает", lane.active, color: .blue)
                queueMetric("Ошибки", lane.failed + lane.needsHuman, color: lane.failed + lane.needsHuman > 0 ? .orange : .secondary)
                Spacer()
            }

            Grid(alignment: .leading, horizontalSpacing: 14, verticalSpacing: 10) {
                GridRow {
                    Text("Модель").foregroundStyle(.secondary)
                    TextField("codex-default", text: $model)
                        .textFieldStyle(.roundedBorder)
                        .frame(minWidth: 230)
                }
                GridRow {
                    Text("Параллельность").foregroundStyle(.secondary)
                    Stepper(value: $concurrency, in: 0...8) {
                        Text("\(concurrency)")
                            .monospacedDigit()
                            .frame(width: 28, alignment: .trailing)
                    }
                }
                GridRow {
                    Text("Таймаут").foregroundStyle(.secondary)
                    Stepper(value: $timeout, in: 30...1800, step: 30) {
                        Text("\(timeout) секунд")
                            .monospacedDigit()
                    }
                }
            }

            HStack {
                Text("Изменения профиля сохраняются в StaticCreo backend и применяются при следующей задаче.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Button("Сохранить профиль") {
                    Task {
                        await store.saveStaticCreoProfile(
                            lane,
                            model: model,
                            enabled: enabled,
                            maxConcurrency: concurrency,
                            timeoutSeconds: timeout
                        )
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(store.isStaticCreoControlBusy || !isDirty)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }

    private var isDirty: Bool {
        model != (lane.model ?? "codex-default")
            || enabled != lane.enabled
            || concurrency != lane.maxConcurrency
            || timeout != lane.timeoutSeconds
    }

    private var laneTitle: String {
        switch lane.slug {
        case "luna": "Быстрые AI-задачи"
        case "terra": "Глубокий анализ"
        case "image": "Генерация изображений"
        default: lane.slug.capitalized
        }
    }

    private var laneDescription: String {
        switch lane.slug {
        case "luna": "Промпты, preflight, гипотезы и короткие ответы"
        case "terra": "Сложные разборы и задачи с большим контекстом"
        case "image": "Production jobs через Codex subscription worker"
        default: "AI-профиль StaticCreo"
        }
    }

    private var laneIcon: String {
        switch lane.slug {
        case "luna": "bolt.fill"
        case "terra": "brain.head.profile"
        case "image": "photo.on.rectangle.angled"
        default: "cpu"
        }
    }

    private func queueMetric(_ title: String, _ value: Int, color: Color) -> some View {
        HStack(spacing: 5) {
            Text(title).foregroundStyle(.secondary)
            Text(String(value)).fontWeight(.semibold).foregroundStyle(color)
        }
        .font(.caption)
        .padding(.horizontal, 8)
        .padding(.vertical, 5)
        .background(.quaternary.opacity(0.5), in: Capsule())
    }
}
