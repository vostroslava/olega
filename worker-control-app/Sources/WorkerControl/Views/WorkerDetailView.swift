import AppKit
import SwiftUI

struct WorkerDetailView: View {
    @Bindable var store: WorkerStore
    let worker: WorkerDefinition

    @AppStorage("confirmBeforeStop") private var confirmBeforeStop = true
    @State private var showStopConfirmation = false
    @State private var selectedLog: LogKind = .standard

    private var status: WorkerRuntimeStatus { store.status(for: worker) }
    private var isBusy: Bool { store.busyWorkers.contains(worker.id) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                header

                if let error = store.errorMessage {
                    messageBanner(error, color: .red, icon: "xmark.octagon.fill")
                } else if let notice = store.notice {
                    messageBanner(notice, color: .green, icon: "checkmark.circle.fill")
                }

                overview
                if worker.id == .staticCreo {
                    StaticCreoControlView(store: store, runtimeStatus: status)
                }
                WorkerConfigurationView(store: store, worker: worker, status: status)
                logs
            }
            .padding(28)
            .frame(maxWidth: 980, alignment: .leading)
        }
        .defaultScrollAnchor(.top)
        .background(.background)
        .confirmationDialog(
            "Выключить \(worker.name)?",
            isPresented: $showStopConfirmation,
            titleVisibility: .visible
        ) {
            Button("Выключить воркер", role: .destructive) {
                Task { await store.perform(.stop, on: worker) }
            }
            Button("Отмена", role: .cancel) {}
        } message: {
            Text("Новые задачи останутся в очереди и продолжат обрабатываться после следующего запуска.")
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 18) {
                Image(systemName: worker.systemImage)
                    .font(.system(size: 28, weight: .medium))
                    .foregroundStyle(.tint)
                    .frame(width: 58, height: 58)
                    .background(.tint.opacity(0.11), in: RoundedRectangle(cornerRadius: 16))

                VStack(alignment: .leading, spacing: 5) {
                    Text(worker.name)
                        .font(.largeTitle.weight(.semibold))
                    Text(worker.summary)
                        .foregroundStyle(.secondary)
                }

                Spacer()
                StatusBadge(health: status.health)
            }

            HStack(spacing: 10) {
                Button {
                    Task { await store.perform(.start, on: worker) }
                } label: {
                    Label("Включить", systemImage: "play.fill")
                }
                .buttonStyle(.borderedProminent)
                .disabled(isBusy || !status.installed || (status.loaded && status.enabled))

                Button {
                    Task { await store.perform(.restart, on: worker) }
                } label: {
                    Label("Перезапустить", systemImage: "arrow.clockwise")
                }
                .buttonStyle(.bordered)
                .disabled(isBusy || !status.installed || !status.loaded)

                Button(role: .destructive) {
                    if confirmBeforeStop {
                        showStopConfirmation = true
                    } else {
                        Task { await store.perform(.stop, on: worker) }
                    }
                } label: {
                    Label("Выключить", systemImage: "stop.fill")
                }
                .buttonStyle(.bordered)
                .disabled(isBusy || !status.installed || (!status.loaded && !status.enabled))

                if isBusy {
                    ProgressView().controlSize(.small)
                }
            }
        }
    }

    private var overview: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Состояние")
                .font(.title2.weight(.semibold))

            Grid(alignment: .leading, horizontalSpacing: 18, verticalSpacing: 12) {
                GridRow {
                    metric("LaunchAgent", status.enabled ? "Разрешён" : "Отключён", "power")
                    metric("Процесс", status.loaded ? "PID \(status.pidText)" : "Не запущен", "cpu")
                    metric("Последний exit", status.exitCodeText, "terminal")
                }
                GridRow {
                    metric("Plist", status.installed ? "Найден" : "Не найден", "doc.badge.gearshape")
                    metric("Связь", remoteStatusText, "network")
                    metric("Проверено", WorkerPresentation.relativeDate(status.checkedAt), "clock")
                }
            }
        }
        .padding(18)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var remoteStatusText: String {
        switch status.remoteOnline {
        case true: "Heartbeat online"
        case false: "Нет heartbeat"
        case nil: "Локальный контроль"
        }
    }

    private func metric(_ title: String, _ value: String, _ icon: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(.secondary)
                .frame(width: 18)
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.callout.weight(.medium))
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var logs: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Журнал")
                    .font(.title2.weight(.semibold))
                Spacer()
                Picker("Журнал", selection: $selectedLog) {
                    ForEach(LogKind.allCases) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.segmented)
                .frame(width: 220)

                Button {
                    let url = selectedLog == .standard ? worker.standardLogURL : worker.errorLogURL
                    NSWorkspace.shared.activateFileViewerSelecting([url])
                } label: {
                    Label("Открыть", systemImage: "folder")
                }
            }

            LogConsole(text: selectedLog == .standard ? status.standardLog : status.errorLog)
        }
    }

    private func messageBanner(_ text: String, color: Color, icon: String) -> some View {
        Label(text, systemImage: icon)
            .font(.callout)
            .foregroundStyle(color)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(color.opacity(0.1), in: RoundedRectangle(cornerRadius: 10))
    }
}

private enum LogKind: String, CaseIterable, Identifiable {
    case standard
    case error

    var id: String { rawValue }
    var title: String { self == .standard ? "Работа" : "Ошибки" }
}
