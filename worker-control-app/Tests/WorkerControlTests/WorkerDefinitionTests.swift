import XCTest
@testable import WorkerControl

final class WorkerDefinitionTests: XCTestCase {
    func testManagedDefinitionsUseExpectedLaunchAgentLabels() {
        let workers = WorkerDefinition.managed(homeDirectory: URL(fileURLWithPath: "/Users/test"))

        XCTAssertEqual(workers.map(\.label), [
            "ai.staticcreo.cloud-worker",
            "by.steklostroygroup.ai-worker",
        ])
        XCTAssertTrue(workers.allSatisfy { $0.plistURL.path.hasPrefix("/Users/test/Library/LaunchAgents/") })
    }

    func testMegabytesSettingRoundTripsToBytes() {
        let setting = try! XCTUnwrap(
            WorkerDefinition.managed()[0].settings.first { $0.environmentKey == "STATICCREO_CACHE_MAX_BYTES" }
        )

        XCTAssertEqual(setting.displayValue(from: "536870912"), "512")
        XCTAssertEqual(setting.storedValue(from: "512"), "536870912")
    }
}
