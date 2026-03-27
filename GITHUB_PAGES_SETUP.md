# GitHub Pages setup

Сайт подготовлен под автодеплой в GitHub Pages из репозитория `vostroslava/olega`.

URL после включения Pages:

`https://vostroslava.github.io/olega/`

Что уже настроено:

- статический export через `Next.js`
- корректный `basePath` для project pages `/olega`
- отключена `next/image`-оптимизация для статического хостинга
- workflow автодеплоя в `.github/workflows/deploy-pages.yml`
- форма поддерживает внешний статический endpoint через `NEXT_PUBLIC_FORM_ENDPOINT`

Что нужно сделать в GitHub:

1. Открыть репозиторий `vostroslava/olega`
2. Перейти в `Settings -> Pages`
3. В поле `Source` выбрать `GitHub Actions`
4. Сохранить настройки
5. Запушить изменения в `main` или вручную запустить workflow `Deploy GitHub Pages`

Как включить реальную отправку формы:

1. Подключить внешний статический form service, например `Formspree`
2. Получить endpoint вида `https://formspree.io/f/xxxxxxx`
3. Открыть `Settings -> Secrets and variables -> Actions -> Variables`
4. Создать переменную `NEXT_PUBLIC_FORM_ENDPOINT`
5. Вставить туда endpoint формы
6. Запустить новый деплой

Если переменная не задана, сайт автоматически использует fallback через `mailto:`

Как проверить локально:

- для разработки: `npm run dev`
- для production-сборки: `npm run build`

Важно:

- Pages собирает сайт через workflow, вручную загружать папку `out` не нужно
- адрес сайта будет не на корне домена, а на пути `/olega/`
- если позже подключите кастомный домен, `basePath` нужно будет пересмотреть
