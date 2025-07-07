# Инструкция по развертыванию Freshpass на Ubuntu сервере

## Требования
- Ubuntu Server 20.04+ 
- Node.js 18+
- PostgreSQL 14+
- Nginx (для проксирования)
- SSL сертификат (Let's Encrypt)

## 1. Подготовка сервера

### Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### Установка Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # должно показать v18+
```

### Установка PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Настройка базы данных
```bash
sudo -u postgres psql

CREATE DATABASE freshpass;
CREATE USER freshpass_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE freshpass TO freshpass_user;
\q
```

### Установка Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 2. Настройка проекта

### Клонирование и установка зависимостей
```bash
cd /var/www
sudo git clone <your-repo-url> freshpass
sudo chown -R $USER:$USER freshpass
cd freshpass
npm install
```

### Создание .env файла
```bash
sudo nano .env
```

Содержимое .env файла:
```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=your_very_long_secure_random_string_here
DATABASE_URL=postgresql://freshpass_user:your_secure_password@localhost:5432/freshpass
```

### Сборка проекта
```bash
npm run build
```

## 3. Настройка PM2 (Process Manager)

### Установка PM2
```bash
sudo npm install -g pm2
```

### Создание конфигурации PM2
```bash
nano ecosystem.config.js
```

Содержимое файла:
```javascript
module.exports = {
  apps: [{
    name: 'freshpass',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### Создание директории для логов
```bash
mkdir logs
```

### Запуск приложения
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Настройка Nginx

### Создание конфигурации для сайта
```bash
sudo nano /etc/nginx/sites-available/freshpass
```

Содержимое файла:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Безопасность
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

### Активация конфигурации
```bash
sudo ln -s /etc/nginx/sites-available/freshpass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Настройка SSL с Let's Encrypt

### Установка Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Получение SSL сертификата
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Автоматическое продление сертификата
```bash
sudo crontab -e
```

Добавить строку:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. Настройка Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 7. Мониторинг и обслуживание

### Просмотр логов приложения
```bash
pm2 logs freshpass
```

### Перезапуск приложения
```bash
pm2 restart freshpass
```

### Обновление проекта
```bash
git pull origin main
npm install
npm run build
pm2 restart freshpass
```

### Резервное копирование базы данных
```bash
pg_dump -h localhost -U freshpass_user freshpass > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 8. Проверка работы

1. Откройте браузер и перейдите на https://your-domain.com
2. Убедитесь что SSL работает (зеленый замок)
3. Проверьте регистрацию и создание пароля
4. Проверьте что приложение работает на порту 3000 локально: `curl localhost:3000`

## Полезные команды

```bash
# Статус PM2
pm2 status

# Мониторинг ресурсов
pm2 monit

# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx

# Проверка PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Просмотр логов системы
sudo journalctl -u nginx
sudo journalctl -u postgresql
```

## Возможные проблемы и решения

### Порт занят
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Проблемы с правами
```bash
sudo chown -R $USER:$USER /var/www/freshpass
sudo chmod -R 755 /var/www/freshpass
```

### База данных не подключается
```bash
sudo -u postgres psql
\l  # список баз данных
\du # список пользователей
```