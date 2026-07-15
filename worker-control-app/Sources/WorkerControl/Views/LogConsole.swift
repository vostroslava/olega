import SwiftUI

struct LogConsole: View {
    let text: String

    var body: some View {
        ScrollView([.horizontal, .vertical]) {
            Text(text.isEmpty ? "Журнал пока пуст." : text)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(text.isEmpty ? .secondary : .primary)
                .textSelection(.enabled)
                .frame(maxWidth: .infinity, alignment: .topLeading)
                .padding(14)
        }
        .frame(minHeight: 190, maxHeight: 290)
        .background(Color(nsColor: .textBackgroundColor).opacity(0.6), in: RoundedRectangle(cornerRadius: 12))
        .overlay {
            RoundedRectangle(cornerRadius: 12)
                .stroke(.separator.opacity(0.55), lineWidth: 1)
        }
    }
}
