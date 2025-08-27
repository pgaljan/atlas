````markdown
# Atlas Manual Deployment Guide

This guide provides lightweight steps for deploying **Atlas** manually on an alternative cloud environment.

---

## 1. Operating System

- Recommended: **Ubuntu 22.04 LTS**
- Keep system updated:
  ```bash
  sudo apt update && sudo apt upgrade -y
````

---

## 2. Console User Setup

* Create a new system user:

  ```bash
  sudo adduser atlas
  sudo usermod -aG sudo atlas
  ```

* Switch to the user:

  ```bash
  su - atlas
  ```

---

## 3. Dependencies

Install essential packages:

```bash
sudo apt install -y build-essential curl git ufw wget unzip nginx
```

---

## 4. UFW Settings

Enable firewall and allow common ports:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 5. SSH Config

* Edit `/etc/ssh/sshd_config`:

  ```
  PermitRootLogin no
  PasswordAuthentication no
  ```
* Restart SSH:

  ```bash
  sudo systemctl restart ssh
  ```

---

## 6. PostgreSQL

### Install

```bash
sudo apt install -y postgresql postgresql-contrib
```

### Database Setup

```bash
sudo -i -u postgres psql
CREATE DATABASE atlas;
CREATE USER atlas_user WITH ENCRYPTED PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE atlas TO atlas_user;
\q
```

### Security Config

* Ensure `pg_hba.conf` allows local connections via `md5`.
* Restart service:

  ```bash
  sudo systemctl restart postgresql
  ```

### Initialization

Run Prisma migrations from Atlas backend later.

---

## 7. Syncfusion

* Install npm package inside Atlas project:

  ```bash
  npm install @syncfusion/ej2 --save
  ```
* Add license in project entrypoint:

  ```js
  import { registerLicense } from '@syncfusion/ej2-base';
  registerLicense('YOUR_SYNCFUSION_LICENSE_KEY');
  ```

---

## 8. Node.js

### Install

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Verify

```bash
node -v
npm -v
```

---

## 9. PM2 (Backend + Frontend)

Install PM2 globally:

```bash
sudo npm install -g pm2
```

### Backend

```bash
cd ~/atlas/api
npm install
cp .env   # configure DB, keys, secrets
# Example env value
API_PREFIX=/api/v1

# Prisma
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Start backend with PM2
pm2 start "npm run start" --name api
```

### Frontend

```bash
cd ~/atlas/web
npm install
cp .env   # configure API URL
# Example env value
VITE_API_URL=https://dev.atlasflow.co/api/v1

# Build frontend
npm run build

# Serve frontend using PM2 (with serve or similar)
npm install -g serve
pm2 start "serve -s build -l 5174" --name web
```

### Save PM2 Processes

```bash
pm2 save
pm2 startup systemd
```

---

## 10. Nginx

### Install

```bash
sudo apt install -y nginx
```

### Config (Backend + Frontend)

Create `/etc/nginx/sites-available/atlas`:

```nginx
server {
    listen 80;
    server_name dev.atlasflow.co;

    location /api/v1/ {
        proxy_pass http://localhost:4001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:5174/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable config:

```bash
sudo ln -s /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Security

```bash
sudo ufw allow 'Nginx Full'
```

---

## 11. Atlas Application Flow

1. **Clone Repos**

   ```bash
   git clone https://gitlab.techcrusades.com/atlas/atlas-web-app.git
   ```

2. **Backend Setup**

   * Install deps
   * Setup `.env` (make sure `API_PREFIX=/api/v1`)
   * Run `npx prisma generate`
   * Run `npx prisma migrate deploy`
   * Run `npx prisma db seed` if needed
   * Start via PM2

3. **Frontend Setup**

   * Install deps
   * Setup `.env` (`VITE_API_URL=https://dev.atlasflow.co/api/v1`)
   * Run `npm run build`
   * Serve with PM2

---

## 12. SSL with Certbot

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

### Verify Renewal

```bash
sudo certbot renew --dry-run
```
