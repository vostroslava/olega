# Local AI worker

Локальный обработчик заявок и чата СтеклоСтройГрупп. Использует отдельный Supabase-проект как надёжную очередь и `codex exec` через текущий вход ChatGPT как AI-исполнитель.

Runtime устанавливается на внутренний диск:

`~/Library/Application Support/StekloStroyGroup/ai-worker`

Логи:

`~/Library/Logs/StekloStroyGroup/`

Секрет подключения к базе хранится в macOS Keychain под service `ai.steklostroy.database-url`; в plist, репозитории и браузере его нет.

Команды:

```bash
npm --prefix local-worker run check
npm --prefix local-worker run run:once
npm --prefix local-worker run install:mac
npm --prefix local-worker run uninstall:mac
```

AI отвечает только по подтверждённой базе `knowledge/site-knowledge.md`. Цена, срок, инженерный узел и нормативное заключение всегда эскалируются человеку.

После завершения AI-разбора новой заявки worker показывает локальное уведомление macOS. Сама заявка, исходные данные и разбор остаются в отдельном Supabase-проекте; уведомление не содержит персональных данных.
