import Foundation

struct StaticCreoRuntimeSnapshot: Decodable, Equatable, Sendable {
    let cacheBytes: Int64
    let cacheLimitBytes: Int64
    let runtimeRoot: String
}

struct StaticCreoHeartbeat: Decodable, Equatable, Sendable {
    let key: String
    let name: String?
    let state: String
    let currentTaskKind: String?
    let currentTaskId: String?
    let lastSeenAt: String?
}

struct StaticCreoLane: Decodable, Equatable, Identifiable, Sendable {
    let slug: String
    let model: String?
    let enabled: Bool
    let maxConcurrency: Int
    let timeoutSeconds: Int
    let queued: Int
    let leased: Int
    let running: Int
    let failed: Int
    let needsHuman: Int

    var id: String { slug }
    var active: Int { leased + running }
}

struct StaticCreoControlSnapshot: Decodable, Equatable, Sendable {
    let ok: Bool
    let generatedAt: String?
    let database: String?
    let error: String?
    let runtime: StaticCreoRuntimeSnapshot?
    let worker: StaticCreoHeartbeat?
    let lanes: [StaticCreoLane]?
    let removedBytes: Int64?
    let removedItems: Int?
}
