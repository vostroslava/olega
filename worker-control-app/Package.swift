// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "WorkerControl",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "WorkerControl", targets: ["WorkerControl"]),
    ],
    targets: [
        .executableTarget(
            name: "WorkerControl",
            path: "Sources/WorkerControl"
        ),
        .testTarget(
            name: "WorkerControlTests",
            dependencies: ["WorkerControl"],
            path: "Tests/WorkerControlTests"
        ),
    ]
)
