# Server Environment Setup Guide

This document provides instructions for setting up the server environment for the Custom Candle E-commerce application.

## System Requirements

- Ubuntu 20.04 LTS or newer
- At least 2GB RAM
- 20GB disk space
- Public IP address with DNS configured

## Initial Server Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Create a Non-Root User

```bash
sudo adduser candle-app
sudo usermod -aG sudo candle-app
```

### 3. Configure SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Make the following changes:
- Set `PasswordAuthentication no`
- Set `PermitRootLogin no`

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 4. Set Up Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Install Node.js

### 1. Install Node.js 18.x

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Verify Installation

```bash
node -v
npm -v
```

### 3. Install PM2 for Process Management

```bash
sudo npm install -g pm2
```

## Install MongoDB

### 1. Import MongoDB Public Key

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
```

### 2. Create a List File for MongoDB

```bash
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

### 3. Install MongoDB

```bash
sudo apt update
sudo apt install -y mongodb-org
```

### 4. Start and Enable MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 5. Verify MongoDB is Running

```bash
sudo systemctl status mongod
```

### 6. Configure MongoDB Security

Create an admin user:

```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "adminUser",
  pwd: "securePassword",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
exit
```

Edit the MongoDB configuration:

```bash
sudo nano /etc/mongod.conf
```

Add security settings:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

## Install Nginx

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Configure Nginx as a Reverse Proxy

Create a new site configuration:

```bash
sudo nano /etc/nginx/sites-available/candle-ecommerce
```

Add the following configuration:

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
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/candle-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Set Up SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Application Deployment

### 1. Create Application Directory

```bash
sudo mkdir -p /var/www/candle-ecommerce
sudo chown candle-app:candle-app /var/www/candle-ecommerce
```

### 2. Clone Repository

```bash
cd /var/www/candle-ecommerce
git clone https://github.com/your-username/candle-ecommerce.git .
```

### 3. Set Up Environment Variables

Create frontend environment file:

```bash
nano .env.local
```

Add required variables:
```
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Create backend environment file:

```bash
nano server/.env
```

Add required variables:
```
PORT=4000
MONGODB_URI=mongodb://adminUser:securePassword@localhost:27017/candle-ecommerce?authSource=admin
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. Install Dependencies and Build

```bash
# Frontend
npm ci
npm run build

# Backend
cd server
npm ci
npm run build
cd ..
```

### 5. Set Up PM2 for Process Management

Create a PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'candle-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/candle-ecommerce',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'candle-backend',
      script: 'dist/index.js',
      cwd: '/var/www/candle-ecommerce/server',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Start the applications:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Monitoring and Maintenance

### 1. Monitor Application Logs

```bash
pm2 logs
```

### 2. Monitor Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Monitor MongoDB Logs

```bash
sudo tail -f /var/log/mongodb/mongod.log
```

### 4. Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/candle-ecommerce
```

Add the following configuration:

```
/var/www/candle-ecommerce/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 candle-app candle-app
    sharedscripts
    postrotate
        pm2 reload all
    endscript
}
```

## Backup Configuration

See the separate backup documentation for details on setting up automated backups.

## Security Hardening

### 1. Enable Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. Install Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Configure Fail2Ban for SSH

```bash
sudo nano /etc/fail2ban/jail.local
```

Add the following configuration:

```
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

Restart Fail2Ban:

```bash
sudo systemctl restart fail2ban
```

## Troubleshooting

### Common Issues

1. **Application Not Starting**
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables are set correctly
   - Check file permissions

2. **Nginx Not Proxying Requests**
   - Check Nginx configuration: `sudo nginx -t`
   - Verify Nginx is running: `sudo systemctl status nginx`
   - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

3. **MongoDB Connection Issues**
   - Verify MongoDB is running: `sudo systemctl status mongod`
   - Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
   - Verify connection string in environment variables