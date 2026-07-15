import Foundation

enum WorkerID: String, CaseIterable, Identifiable, Codable, Sendable {
    case staticCreo
    case stekloStroy

    var id: String { rawValue }
}

enum WorkerSettingKind: Hashable, Sendable {
    case choice([String])
    case text
    case integer
    case megabytes
}

enum WorkerSettingCategory: String, CaseIterable, Identifiable, Sendable {
    case ai
    case identity
    case performance
    case reliability

    var id: String { rawValue }

    var title: String {
        switch self {
        case .ai: "AI"
        case .identity: "Идентификация"
        case .performance: "Производительность"
        case .reliability: "Надёжность"
        }
    }

    var systemImage: String {
        switch self {
        case .ai: "brain"
        case .identity: "person.text.rectangle"
        case .performance: "gauge.with.dots.needle.50percent"
        case .reliability: "shield.checkered"
        }
    }
}

struct WorkerSettingDefinition: Identifiable, Hashable, Sendable {
    let environmentKey: String
    let title: String
    let detail: String
    let kind: WorkerSettingKind
    let defaultValue: String

    var id: String { environmentKey }

    var category: WorkerSettingCategory {
        switch environmentKey {
        case "STEKLOSTROY_CHAT_MODEL", "STEKLOSTROY_CHAT_REASONING_EFFORT": .ai
        case "STATICCREO_WORKER_NAME": .identity
        case "STATICCREO_CACHE_MAX_BYTES", "STATICCREO_DB_POOL_MAX", "STATICCREO_IDLE_POLL_MS", "STATICCREO_ACTIVE_POLL_MS": .performance
        default: .reliability
        }
    }

    var unit: String? {
        switch environmentKey {
        case "STATICCREO_CACHE_MAX_BYTES": "МБ"
        case "STATICCREO_DB_POOL_MAX": "соединений"
        case let key where key.hasSuffix("_MS"): "мс"
        default: nil
        }
    }

    var numericRange: ClosedRange<Int>? {
        switch environmentKey {
        case "STATICCREO_CACHE_MAX_BYTES": 128...1024
        case "STATICCREO_DB_POOL_MAX": 1...20
        case "STATICCREO_IDLE_POLL_MS": 500...30000
        case "STATICCREO_ACTIVE_POLL_MS": 250...10000
        case "STATICCREO_HEARTBEAT_MS": 5000...60000
        case "STATICCREO_REFERENCE_TIMEOUT_MS": 5000...120000
        case "STATICCREO_CACHE_CLEANUP_MS": 30000...3600000
        case "STEKLOSTROY_AI_TIMEOUT_MS": 30000...600000
        default: nil
        }
    }

    func displayValue(from storedValue: String?) -> String {
        let value = storedValue?.isEmpty == false ? storedValue! : defaultValue
        guard case .megabytes = kind, let bytes = Int64(value) else { return value }
        return String(max(1, bytes / 1_048_576))
    }

    func storedValue(from displayValue: String) -> String {
        let value = displayValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard case .megabytes = kind, let megabytes = Int64(value) else { return value }
        return String(megabytes * 1_048_576)
    }
}

struct WorkerDefinition: Identifiable, Hashable, Sendable {
    let id: WorkerID
    let label: String
    let name: String
    let summary: String
    let systemImage: String
    let plistURL: URL
    let standardLogURL: URL
    let errorLogURL: URL
    let healthURL: URL?
    let settings: [WorkerSettingDefinition]

    static func managed(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) -> [WorkerDefinition] {
        let launchAgents = homeDirectory.appending(path: "Library/LaunchAgents", directoryHint: .isDirectory)
        let logs = homeDirectory.appending(path: "Library/Logs", directoryHint: .isDirectory)

        return [
            WorkerDefinition(
                id: .staticCreo,
                label: "ai.staticcreo.cloud-worker",
                name: "StaticCreo",
                summary: "Производственный AI-воркер креативов",
                systemImage: "wand.and.stars.inverse",
                plistURL: launchAgents.appending(path: "ai.staticcreo.cloud-worker.plist"),
                standardLogURL: logs.appending(path: "StaticCreo/cloud-worker.log"),
                errorLogURL: logs.appending(path: "StaticCreo/cloud-worker.error.log"),
                healthURL: nil,
                settings: [
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_WORKER_NAME",
                        title: "Имя воркера",
                        detail: "Отображается в heartbeat StaticCreo",
                        kind: .text,
                        defaultValue: "Codex subscription worker"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_CACHE_MAX_BYTES",
                        title: "Кэш на диске",
                        detail: "Лимит временных референсов и результатов",
                        kind: .megabytes,
                        defaultValue: "536870912"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_DB_POOL_MAX",
                        title: "Пул базы данных",
                        detail: "Максимум одновременных подключений воркера",
                        kind: .integer,
                        defaultValue: "10"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_IDLE_POLL_MS",
                        title: "Опрос пустой очереди",
                        detail: "Пауза между проверками, когда задач нет",
                        kind: .integer,
                        defaultValue: "2000"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_ACTIVE_POLL_MS",
                        title: "Опрос активной очереди",
                        detail: "Пауза между проверками при работающих задачах",
                        kind: .integer,
                        defaultValue: "1000"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_HEARTBEAT_MS",
                        title: "Heartbeat",
                        detail: "Частота обновления статуса и lease активной задачи",
                        kind: .integer,
                        defaultValue: "15000"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_REFERENCE_TIMEOUT_MS",
                        title: "Загрузка референса",
                        detail: "Максимальное ожидание одного входного файла",
                        kind: .integer,
                        defaultValue: "45000"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STATICCREO_CACHE_CLEANUP_MS",
                        title: "Автоочистка кэша",
                        detail: "Интервал фоновой проверки лимита кэша",
                        kind: .integer,
                        defaultValue: "60000"
                    ),
                ]
            ),
            WorkerDefinition(
                id: .stekloStroy,
                label: "by.steklostroygroup.ai-worker",
                name: "СтеклоСтройГрупп",
                summary: "Сообщения сайта и AI-разбор заявок",
                systemImage: "rectangle.split.3x1.fill",
                plistURL: launchAgents.appending(path: "by.steklostroygroup.ai-worker.plist"),
                standardLogURL: logs.appending(path: "StekloStroyGroup/ai-worker.log"),
                errorLogURL: logs.appending(path: "StekloStroyGroup/ai-worker.error.log"),
                healthURL: URL(string: "https://zoopvbpzrielfzboyvqa.supabase.co/functions/v1/site-api/health"),
                settings: [
                    WorkerSettingDefinition(
                        environmentKey: "STEKLOSTROY_CHAT_MODEL",
                        title: "Модель чата",
                        detail: "Модель для входящих сообщений сайта",
                        kind: .choice(["gpt-5.6-luna", "gpt-5.3-codex-spark"]),
                        defaultValue: "gpt-5.6-luna"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STEKLOSTROY_CHAT_REASONING_EFFORT",
                        title: "Глубина ответа",
                        detail: "Low быстрее и подходит для короткого чата",
                        kind: .choice(["low", "medium", "high"]),
                        defaultValue: "low"
                    ),
                    WorkerSettingDefinition(
                        environmentKey: "STEKLOSTROY_AI_TIMEOUT_MS",
                        title: "Таймаут",
                        detail: "Максимальное ожидание ответа Codex, миллисекунды",
                        kind: .integer,
                        defaultValue: "180000"
                    ),
                ]
            ),
        ]
    }
}
