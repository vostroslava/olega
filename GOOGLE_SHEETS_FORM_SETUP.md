# Google Sheets lead capture

Для сайта на `GitHub Pages` самая простая рабочая схема — отправлять заявки в `Google Sheets`
через `Google Apps Script Web App`.

## Что получится

После отправки формы каждая заявка будет попадать в одну строку таблицы:

- `submitted_at`
- `name`
- `phone`
- `product`
- `message`
- `page`
- `source`
- `consent`

## 1. Создать таблицу

1. Откройте `Google Sheets`
2. Создайте новую таблицу, например `StekloStroyGroup Leads`
3. Скопируйте `Spreadsheet ID` из URL

Пример:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## 2. Создать Apps Script

1. В таблице откройте `Extensions -> Apps Script`
2. Удалите стандартный код
3. Вставьте код из файла:

`integrations/google-apps-script/lead-capture.gs`

4. В строке

`const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE";`

замените значение на ID вашей таблицы

## 3. Опубликовать как Web App

1. Нажмите `Deploy -> New deployment`
2. В типе выберите `Web app`
3. `Execute as`: `Me`
4. `Who has access`: `Anyone`
5. Нажмите `Deploy`
6. Скопируйте URL вида:

`https://script.google.com/macros/s/.../exec`

## 4. Подключить endpoint к сайту

В репозитории GitHub:

1. Откройте `Settings -> Secrets and variables -> Actions -> Variables`
2. Создайте переменную:

`NEXT_PUBLIC_FORM_ENDPOINT`

3. Вставьте туда URL Web App
4. Запустите новый деплой сайта

## 5. Как это работает в коде

Форма на сайте:

- берёт `name`, `phone`, `product`, `message`, `consent`
- добавляет `page`, `source`, `submittedAt`
- отправляет это на Apps Script endpoint

Файл формы:

`components/ui/request-form.tsx`

## 6. Как проверить

1. Откройте сайт
2. Отправьте тестовую заявку
3. Откройте таблицу
4. Проверьте, что появилась новая строка

## 7. Если нужно дальше усилить

Следующий шаг после Google Sheets:

- уведомление в `Telegram`
- письмо менеджеру
- фильтрация спама
- передача в CRM

