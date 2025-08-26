# Запуск и работа с проектом

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Установка

Установите зависимости:

```bash
# yarn
yarn install

# npm
npm install

```

## Запуск сервера

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

## Репозиторий

Создать ветку для работы (если не была создана).
Предпочтительное название должно начинаться с VR-название модуля разработки. 
Например VR_main-page:

```bash
git checkout -b название ветки
```

После изменений в файлах выполнить:

```bash
yarn lint:fix
```

Если есть ошибки, исправить. Еще раз проверить:

```bash
yarn lint:fix
```

Если ошибок нет:

```bash
yarn add .

git commit -m"feat: описание изменения"

git commit -m"fix описание исправления"
```

Отправить изменения в свою ветку:

```bash
git push "название своей ветки"
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
