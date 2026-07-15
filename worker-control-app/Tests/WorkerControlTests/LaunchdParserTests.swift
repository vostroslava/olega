import XCTest
@testable import WorkerControl

final class LaunchdParserTests: XCTestCase {
    func testParsesPrimaryRuntimeStateWithoutUsingCoalitionState() {
        let output = """
        gui/501/example.worker = {
            state = running
            runs = 7
            pid = 60627
            last exit code = 1
            resource coalition = {
                state = active
            }
        }
        """

        let snapshot = LaunchdParser.snapshot(from: output)

        XCTAssertEqual(snapshot.activity, .running)
        XCTAssertEqual(snapshot.pid, 60627)
        XCTAssertEqual(snapshot.lastExitCode, 1)
    }

    func testParsesStoppedWorkerWithoutPid() {
        let output = """
        gui/501/example.worker = {
            state = exited
            last exit code = 0
        }
        """

        let snapshot = LaunchdParser.snapshot(from: output)

        XCTAssertEqual(snapshot.activity, .stopped)
        XCTAssertNil(snapshot.pid)
        XCTAssertEqual(snapshot.lastExitCode, 0)
    }

    func testFindsPersistentDisabledOverride() {
        let output = """
        disabled services = {
            "ai.staticcreo.cloud-worker" => false
            "by.steklostroygroup.ai-worker" => true
        }
        """

        XCTAssertFalse(LaunchdParser.isDisabled(label: "ai.staticcreo.cloud-worker", in: output))
        XCTAssertTrue(LaunchdParser.isDisabled(label: "by.steklostroygroup.ai-worker", in: output))
    }

    func testFindsDisabledWordUsedByCurrentMacOS() {
        let output = """
        disabled services = {
            "ai.staticcreo.cloud-worker" => enabled
            "by.steklostroygroup.ai-worker" => disabled
        }
        """

        XCTAssertFalse(LaunchdParser.isDisabled(label: "ai.staticcreo.cloud-worker", in: output))
        XCTAssertTrue(LaunchdParser.isDisabled(label: "by.steklostroygroup.ai-worker", in: output))
    }
}
