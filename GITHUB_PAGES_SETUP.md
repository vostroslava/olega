# GitHub Pages setup

Сайт подготовлен под автодеплой в GitHub Pages из репозитория `vostroslava/olega`.

URL после включения Pages:

`https://vostroslava.github.io/olega/`

Что уже настроено:

- статический export через `Next.js`
- корректный `basePath` для project pages `/olega`
- отключена `next/image`-оптимизация для статического хостинга
- workflow автодеплоя в `.github/workflows/deploy-pages.yml`

Что нужно сделать в GitHub:

1. Открыть репозиторий `vostroslava/olega`
2. Перейти в `Settings -> Pages`
3. В поле `Source` выбрать `GitHub Actions`
4. Сохранить настройки
5. Запушить изменения в `main` или вручную запустить workflow `Deploy GitHub Pages`

Как проверить локально:

- для разработки: `npm run dev`
- для production-сборки: `npm run build`

Важно:

- Pages собирает сайт через workflow, вручную загружать папку `out` не нужно
- адрес сайта будет не на корне домена, а на пути `/olega/`
- если позже подключите кастомный домен, `basePath` нужно будет пересмотреть
