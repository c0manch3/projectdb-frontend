# Инструкция по деплою исправления HTTPS

## Проблема
Фронтенд работает по HTTPS (`https://lencondb.ru`), но отправляет запросы к API по HTTP (`http://209.38.74.75:3000`). Браузер блокирует такие "смешанные" запросы (Mixed Content).

## Решение
Настроить nginx для проксирования запросов `/api` на бэкенд сервер.

## Что было изменено

### 1. `.env.production`
```env
# Было:
VITE_API_BASE_URL=http://209.38.74.75:3000

# Стало:
VITE_API_BASE_URL=/api
```

### 2. `nginx/default.conf`
Раскомментирована и активирована секция проксирования API (строки 59-82).

## Шаги деплоя

### Шаг 1: Загрузите файлы на сервер

```bash
# Загрузите собранные файлы из папки dist/
scp -r dist/* user@your-server:/var/www/lencondb.ru/

# Загрузите обновленную конфигурацию nginx
scp nginx/default.conf user@your-server:/etc/nginx/sites-available/lencondb.ru
```

### Шаг 2: На сервере обновите nginx конфигурацию

```bash
# Подключитесь к серверу
ssh user@your-server

# Создайте symlink если еще не создан
sudo ln -sf /etc/nginx/sites-available/lencondb.ru /etc/nginx/sites-enabled/

# Проверьте конфигурацию nginx
sudo nginx -t

# Если проверка успешна, перезагрузите nginx
sudo systemctl reload nginx
```

### Шаг 3: Убедитесь что бэкенд работает

```bash
# Проверьте что бэкенд доступен
curl http://209.38.74.75:3000/health
# или
curl http://209.38.74.75:3000/api/health
```

### Шаг 4: Проверьте работу

Откройте в браузере `https://lencondb.ru` и проверьте:
1. Нет ошибок "Mixed Content" в консоли
2. API запросы идут на `https://lencondb.ru/api/...`
3. Логин работает корректно

## Проверка работы проксирования

После деплоя проверьте в DevTools:
- Network tab должен показывать запросы к `https://lencondb.ru/api/...`
- Не должно быть запросов к `http://209.38.74.75:3000`

## Альтернативное решение

Если у вас есть SSL сертификат для IP `209.38.74.75` или доменное имя для бэкенда (например, `api.lencondb.ru`), можно использовать прямой HTTPS URL:

```env
VITE_API_BASE_URL=https://api.lencondb.ru
```

Но рекомендуется использовать проксирование через nginx, так как:
- Проще управлять одним SSL сертификатом
- Можно добавить rate limiting и другие middleware
- Скрывается реальный IP бэкенда от клиентов
