# Netlify Deployment Setup

## Environment Variables

В Netlify Dashboard → Site settings → Environment variables добавьте:

```
VITE_API_URL=https://vapor-backend-sy48.onrender.com/api
VITE_STORAGE_URL=https://vapor-backend-sy48.onrender.com
```

## Build Settings

- **Base directory:** `frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`

## После настройки

1. Сохраните настройки
2. Запустите новый деплой (или он запустится автоматически)
3. Дождитесь завершения сборки

## Проверка

После деплоя сайт должен быть доступен по адресу Netlify (например: `https://vaporchernivtsi.netlify.app`).

## Troubleshooting

Если видите ошибку "Не вдалося підключитися до сервера":
1. Проверьте, что environment variables установлены в Netlify
2. Проверьте, что backend работает на Render
3. Проверьте CORS настройки на backend (должны разрешать Netlify домены)

