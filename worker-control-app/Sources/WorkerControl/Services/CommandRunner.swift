import Foundation

struct CommandResult: Sendable {
    let exitCode: Int32
    let standardOutput: String
    let standardError: String
}

struct CommandFailure: LocalizedError, Sendable {
    let executable: String
    let arguments: [String]
    let result: CommandResult

    var errorDescription: String? {
        let message = result.standardError.trimmingCharacters(in: .whitespacesAndNewlines)
        return message.isEmpty
            ? "Команда \(executable) завершилась с кодом \(result.exitCode)"
            : message
    }
}

struct CommandRunner: Sendable {
    func run(
        _ executable: String,
        arguments: [String],
        environment: [String: String] = [:],
        allowFailure: Bool = false
    ) async throws -> CommandResult {
        let result = try await Task.detached(priority: .userInitiated) {
            let process = Process()
            let standardOutput = Pipe()
            let standardError = Pipe()
            process.executableURL = URL(fileURLWithPath: executable)
            process.arguments = arguments
            process.environment = ProcessInfo.processInfo.environment.merging(environment) { _, override in override }
            process.standardOutput = standardOutput
            process.standardError = standardError

            try process.run()
            process.waitUntilExit()

            return CommandResult(
                exitCode: process.terminationStatus,
                standardOutput: String(decoding: standardOutput.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self),
                standardError: String(decoding: standardError.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
            )
        }.value

        if !allowFailure, result.exitCode != 0 {
            throw CommandFailure(executable: executable, arguments: arguments, result: result)
        }
        return result
    }
}
