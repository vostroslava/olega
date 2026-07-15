import Foundation
import Observation

@MainActor
@Observable
final class WorkerStore {
    let workers: [WorkerDefinition]
    var statuses: [WorkerID: WorkerRuntimeStatus]
    var selection: WorkerID
    var busyWorkers: Set<WorkerID> = []
    var notice: String?
    var errorMessage: String?
    var isRefreshing = false
    var staticCreoControl: StaticCreoControlSnapshot?
    var staticCreoControlError: String?
    var isStaticCreoControlBusy = false

    private let service = LaunchdService()
    private let staticCreoService = StaticCreoControlService()

    init(workers: [WorkerDefinition] = WorkerDefinition.managed()) {
        self.workers = workers
        self.statuses = Dictionary(uniqueKeysWithValues: workers.map { ($0.id, .loading) })
        self.selection = workers.first?.id ?? .staticCreo
    }

    var selectedWorker: WorkerDefinition? {
        workers.first { $0.id == selection }
    }

    var overallHealth: WorkerHealth {
        let values = workers.map { status(for: $0).health }
        if values.contains(.attention) { return .attention }
        if values.contains(.unavailable) { return .unavailable }
        if values.allSatisfy({ $0 == .healthy }) { return .healthy }
        return .stopped
    }

    func status(for worker: WorkerDefinition) -> WorkerRuntimeStatus {
        statuses[worker.id] ?? .loading
    }

    func refresh() async {
        guard !isRefreshing else { return }
        isRefreshing = true
        defer { isRefreshing = false }

        for worker in workers {
            statuses[worker.id] = await service.status(for: worker)
        }
        do {
            staticCreoControl = try await staticCreoService.status()
            staticCreoControlError = nil
        } catch {
            staticCreoControlError = error.localizedDescription
        }
    }

    func runRefreshLoop() async {
        while !Task.isCancelled {
            await refresh()
            let configured = UserDefaults.standard.double(forKey: "refreshInterval")
            let seconds = configured > 0 ? configured : 4
            try? await Task.sleep(for: .seconds(seconds))
        }
    }

    func perform(_ action: WorkerAction, on worker: WorkerDefinition) async {
        guard !busyWorkers.contains(worker.id) else { return }
        busyWorkers.insert(worker.id)
        notice = nil
        errorMessage = nil
        defer { busyWorkers.remove(worker.id) }

        do {
            try await service.perform(action, for: worker)
            try? await Task.sleep(for: .milliseconds(500))
            statuses[worker.id] = await service.status(for: worker)
            notice = switch action {
            case .start: "\(worker.name) включён"
            case .stop: "\(worker.name) выключен"
            case .restart: "\(worker.name) перезапущен"
            }
        } catch {
            errorMessage = error.localizedDescription
            statuses[worker.id] = await service.status(for: worker)
        }
    }

    func saveSettings(_ draft: [String: String], for worker: WorkerDefinition) async {
        guard !busyWorkers.contains(worker.id) else { return }
        busyWorkers.insert(worker.id)
        notice = nil
        errorMessage = nil
        defer { busyWorkers.remove(worker.id) }

        do {
            var stored: [String: String] = [:]
            for setting in worker.settings {
                let value = draft[setting.environmentKey] ?? setting.displayValue(from: status(for: worker).environment[setting.environmentKey])
                try validate(value, setting: setting)
                stored[setting.environmentKey] = setting.storedValue(from: value)
            }
            try await service.updateEnvironment(stored, for: worker)
            try? await Task.sleep(for: .milliseconds(700))
            statuses[worker.id] = await service.status(for: worker)
            notice = "Настройки \(worker.name) сохранены"
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func saveStaticCreoProfile(
        _ lane: StaticCreoLane,
        model: String,
        enabled: Bool,
        maxConcurrency: Int,
        timeoutSeconds: Int
    ) async {
        guard !isStaticCreoControlBusy else { return }
        isStaticCreoControlBusy = true
        notice = nil
        errorMessage = nil
        defer { isStaticCreoControlBusy = false }

        do {
            let cleanModel = model.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !cleanModel.isEmpty, cleanModel.count <= 120 else {
                throw StaticProfileValidationError.model
            }
            guard (0...8).contains(maxConcurrency), !enabled || maxConcurrency > 0 else {
                throw StaticProfileValidationError.concurrency
            }
            guard (30...1800).contains(timeoutSeconds) else {
                throw StaticProfileValidationError.timeout
            }
            try await staticCreoService.updateProfile(
                lane,
                model: cleanModel,
                enabled: enabled,
                maxConcurrency: maxConcurrency,
                timeoutSeconds: timeoutSeconds
            )
            staticCreoControl = try await staticCreoService.status()
            notice = "Профиль \(lane.slug.capitalized) сохранён"
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func purgeStaticCreoCache() async {
        guard !isStaticCreoControlBusy else { return }
        guard let worker = workers.first(where: { $0.id == .staticCreo }), !status(for: worker).loaded else {
            errorMessage = "Перед очисткой кэша выключите StaticCreo"
            return
        }
        isStaticCreoControlBusy = true
        notice = nil
        errorMessage = nil
        defer { isStaticCreoControlBusy = false }

        do {
            let result = try await staticCreoService.purgeCache()
            staticCreoControl = try await staticCreoService.status()
            notice = "Кэш очищен: удалено \(ByteCountFormatter.string(fromByteCount: result.removedBytes ?? 0, countStyle: .file))"
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func validate(_ value: String, setting: WorkerSettingDefinition) throws {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw SettingsValidationError.empty(setting.title) }
        switch setting.kind {
        case .choice(let values):
            guard values.contains(trimmed) else { throw SettingsValidationError.invalid(setting.title) }
        case .integer:
            guard let number = Int(trimmed), number > 0 else { throw SettingsValidationError.invalid(setting.title) }
            if let range = setting.numericRange, !range.contains(number) {
                throw SettingsValidationError.range(setting.title, range)
            }
        case .megabytes:
            guard let number = Int(trimmed) else { throw SettingsValidationError.invalid(setting.title) }
            if let range = setting.numericRange, !range.contains(number) {
                throw SettingsValidationError.range(setting.title, range)
            }
        case .text:
            guard trimmed.count <= 120 else { throw SettingsValidationError.invalid(setting.title) }
        }
    }
}

enum StaticProfileValidationError: LocalizedError {
    case model
    case concurrency
    case timeout

    var errorDescription: String? {
        switch self {
        case .model: "Укажите корректную модель (до 120 символов)"
        case .concurrency: "Concurrency должен быть от 1 до 8 для включённого профиля"
        case .timeout: "Таймаут профиля должен быть от 30 до 1800 секунд"
        }
    }
}

enum SettingsValidationError: LocalizedError {
    case empty(String)
    case invalid(String)
    case range(String, ClosedRange<Int>)

    var errorDescription: String? {
        switch self {
        case .empty(let title): "Заполните поле «\(title)»"
        case .invalid(let title): "Проверьте значение поля «\(title)»"
        case .range(let title, let range): "«\(title)»: допустимо от \(range.lowerBound) до \(range.upperBound)"
        }
    }
}
