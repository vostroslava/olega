# Worker Control

Нативный центр управления локальными AI-воркерами на macOS. Первая версия объединяет существующие LaunchAgent-сервисы StaticCreo и СтеклоСтройГрупп в одном интерфейсе.

## Назначение

- видеть фактический статус, PID и последний код завершения каждого воркера;
- включать, выключать и перезапускать LaunchAgent без Terminal;
- редактировать безопасные настройки моделей и runtime;
- смотреть последние строки обычного и error-log;
- быстро контролировать оба сервиса из menu bar.

Для StaticCreo дополнительно доступны живые очереди Luna/Terra/Image, модели executor-профилей, включение lane, concurrency, timeout, heartbeat backend, размер и безопасная очистка временного кэша, частота опроса, heartbeat, пул БД и таймауты runtime.

## Входные данные

Источник состояния — реальные plist и процессы пользователя:

- `~/Library/LaunchAgents/ai.staticcreo.cloud-worker.plist`;
- `~/Library/LaunchAgents/by.steklostroygroup.ai-worker.plist`;
- соответствующие журналы в `~/Library/Logs/StaticCreo/` и `~/Library/Logs/StekloStroyGroup/`.

Приложение не показывает секреты Supabase, Keychain или содержимое заявок. StaticCreo control-команда получает подключение из закрытого runtime env-файла, а сертификат базы хранится на внутреннем диске в `~/Library/Application Support/StaticCreo/`.

## Ожидаемый результат

Собранное приложение находится в `dist/WorkerControl.app`, а команда запуска ставит свежую копию во внутреннюю папку `~/Applications/WorkerControl.app`. Оно управляет только двумя явно описанными пользовательскими LaunchAgent и не создаёт параллельные копии воркеров.

## Основные папки и точки входа

- `Sources/WorkerControl/App/` — сцены приложения и menu bar;
- `Sources/WorkerControl/Views/` — sidebar, детали, настройки и логи;
- `Sources/WorkerControl/Models/` — определения и runtime-состояние воркеров;
- `Sources/WorkerControl/Stores/` — состояние интерфейса и операции пользователя;
- `Sources/WorkerControl/Services/` — `launchctl`, plist, health-check и чтение логов;
- `Tests/WorkerControlTests/` — проверка парсинга `launchctl`;
- `script/build_and_run.sh` — единая сборка и запуск.

## Источник правды

Список управляемых сервисов и разрешённых параметров находится в `Sources/WorkerControl/Models/WorkerDefinition.swift`. Фактический runtime-статус всегда читается из `launchctl` и plist, а не из локального кэша интерфейса.

## Проверка

```bash
swift test
./script/build_and_run.sh --verify
```

Приложение работает без sandbox, потому что должно читать и перезагружать пользовательские plist в `~/Library/LaunchAgents`. Оно не запрашивает права администратора.
