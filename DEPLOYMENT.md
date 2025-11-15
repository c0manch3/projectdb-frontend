# Production Deployment Guide

Complete guide for deploying the ProjectDB Frontend to production server at 209.38.74.75 with domain lencondb.ru.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [SSL Certificate Setup (Let's Encrypt)](#ssl-certificate-setup)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment (Alternative)](#manual-deployment-alternative)
6. [Automated Deployment Script](#automated-deployment-script)
7. [CI/CD Setup (Optional)](#cicd-setup-optional)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Machine Requirements
- Node.js 20+ and npm installed
- Docker installed (for testing locally)
- SSH access to the server (209.38.74.75)
- Git repository access

### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Nginx installed (for SSL proxy)
- Root or sudo access
- Domain lencondb.ru pointing to 209.38.74.75

---

## Server Setup

### Step 1: Connect to Server
```bash
ssh root@209.38.74.75
```

### Step 2: Install Docker and Docker Compose
```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Install Nginx (for SSL termination)
```bash
# Install nginx
sudo apt install -y nginx

# Enable nginx to start on boot
sudo systemctl enable nginx
sudo systemctl start nginx

# Check nginx status
sudo systemctl status nginx
```

### Step 4: Configure Firewall
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow backend API port (if needed)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## SSL Certificate Setup (Let's Encrypt)

### Step 1: Install Certbot
```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate
```bash
# Make sure your domain points to this server's IP
# Then obtain certificate (this will auto-configure nginx)
sudo certbot --nginx -d lencondb.ru -d www.lencondb.ru

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

### Step 3: Verify Auto-Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run

# Certbot will automatically renew certificates before expiry
```

### Step 4: Configure Nginx as Reverse Proxy
Create nginx configuration for the frontend:

```bash
sudo nano /etc/nginx/sites-available/lencondb.ru
```

Add the following configuration:
```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name lencondb.ru www.lencondb.ru;

    # Certbot validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name lencondb.ru www.lencondb.ru;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/lencondb.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lencondb.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/lencondb.ru-access.log;
    error_log /var/log/nginx/lencondb.ru-error.log;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:8080/health;
    }
}
```

Enable the configuration:
```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/lencondb.ru /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## Docker Deployment

### Step 1: Create Project Directory
```bash
# On the server
sudo mkdir -p /opt/projectdb-frontend
cd /opt/projectdb-frontend
```

### Step 2: Upload Project Files
From your local machine:
```bash
# Create a deployment archive (excluding unnecessary files)
tar -czf projectdb-frontend.tar.gz \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='*.tar.gz' \
    .

# Upload to server
scp projectdb-frontend.tar.gz root@209.38.74.75:/tmp/

# On the server, extract files
cd /opt/projectdb-frontend
tar -xzf /tmp/projectdb-frontend.tar.gz
rm /tmp/projectdb-frontend.tar.gz
```

### Step 3: Build Docker Image
```bash
# On the server
cd /opt/projectdb-frontend

# Build the Docker image
docker build -t projectdb-frontend:latest .

# Verify image was created
docker images | grep projectdb-frontend
```

### Step 4: Run Docker Container
```bash
# Start the container
docker run -d \
    --name projectdb-frontend \
    --restart unless-stopped \
    -p 8080:80 \
    projectdb-frontend:latest

# Check container is running
docker ps | grep projectdb-frontend

# View container logs
docker logs projectdb-frontend

# Follow logs in real-time
docker logs -f projectdb-frontend
```

### Alternative: Using Docker Compose
```bash
# On the server
cd /opt/projectdb-frontend

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Manual Deployment (Alternative)

If you prefer not to use Docker:

### Step 1: Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Build and Deploy
```bash
# On your local machine, build the project
npm run build

# Upload build directory to server
scp -r dist/ root@209.38.74.75:/var/www/lencondb.ru/

# On the server, configure nginx to serve static files
sudo nano /etc/nginx/sites-available/lencondb.ru
```

Update the location block:
```nginx
location / {
    root /var/www/lencondb.ru;
    try_files $uri $uri/ /index.html;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## Automated Deployment Script

We've created an automated deployment script for easier deployments.

### Usage
```bash
# Make script executable (already done)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

The script will:
1. Run tests
2. Run type checking
3. Run linter
4. Build the application
5. Create deployment archive
6. Upload to server
7. Deploy using Docker
8. Cleanup

### Customize the Script
Edit `scripts/deploy.sh` and update these variables:
```bash
SERVER_USER="root"          # Your server username
SERVER_HOST="209.38.74.75"  # Your server IP
SERVER_PATH="/opt/projectdb-frontend"
```

---

## CI/CD Setup (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Run type check
        run: npm run type-check

      - name: Run linter
        run: npm run lint

      - name: Build application
        run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/projectdb-frontend
            git pull origin main
            docker build -t projectdb-frontend:latest .
            docker stop projectdb-frontend || true
            docker rm projectdb-frontend || true
            docker run -d \
              --name projectdb-frontend \
              --restart unless-stopped \
              -p 8080:80 \
              projectdb-frontend:latest
```

### Setup GitHub Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `SERVER_HOST`: 209.38.74.75
   - `SERVER_USER`: root (or your username)
   - `SSH_PRIVATE_KEY`: Your private SSH key

---

## Monitoring and Maintenance

### Container Management
```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Stop container
docker stop projectdb-frontend

# Start container
docker start projectdb-frontend

# Restart container
docker restart projectdb-frontend

# Remove container
docker rm -f projectdb-frontend

# View container logs
docker logs projectdb-frontend

# Follow logs in real-time
docker logs -f projectdb-frontend

# View container resource usage
docker stats projectdb-frontend
```

### Image Management
```bash
# List images
docker images

# Remove old images
docker image prune -a

# Build new image with tag
docker build -t projectdb-frontend:v1.0.0 .
```

### Health Checks
```bash
# Check frontend health
curl http://localhost:8080/health

# Check via domain
curl https://lencondb.ru/health

# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/lencondb.ru-access.log
sudo tail -f /var/log/nginx/lencondb.ru-error.log
```

### SSL Certificate Renewal
```bash
# Check certificate expiry
sudo certbot certificates

# Manually renew certificates
sudo certbot renew

# Test renewal process
sudo certbot renew --dry-run
```

### Backup Strategy
```bash
# Backup Docker image
docker save projectdb-frontend:latest | gzip > projectdb-frontend-backup.tar.gz

# Restore Docker image
docker load < projectdb-frontend-backup.tar.gz

# Backup nginx configuration
sudo tar -czf nginx-config-backup.tar.gz /etc/nginx/
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check Docker logs
docker logs projectdb-frontend

# Check if port is already in use
sudo netstat -tulpn | grep 8080

# Check Docker daemon status
sudo systemctl status docker
```

### 502 Bad Gateway Error
```bash
# Check if container is running
docker ps | grep projectdb-frontend

# Check nginx logs
sudo tail -f /var/log/nginx/lencondb.ru-error.log

# Verify proxy_pass is correct
sudo nginx -t
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Check nginx SSL configuration
sudo nginx -t
```

### Frontend Can't Connect to Backend
1. Check CORS configuration on backend (should allow requests from lencondb.ru)
2. Verify API_BASE_URL in src/services/api.ts
3. Check if backend is running: `curl http://209.38.74.75:3000/health`
4. Review backend logs for CORS errors

### Application Not Loading
```bash
# Check nginx access logs
sudo tail -f /var/log/nginx/lencondb.ru-access.log

# Check container logs
docker logs projectdb-frontend

# Verify DNS is pointing to server
nslookup lencondb.ru

# Test local connection
curl -I http://localhost:8080
```

### High Memory Usage
```bash
# Check container resource usage
docker stats projectdb-frontend

# Adjust resource limits in docker-compose.yml
# Then restart container
docker-compose up -d
```

---

## Quick Reference Commands

```bash
# Deploy new version
./scripts/deploy.sh

# Manual deployment steps
cd /opt/projectdb-frontend
git pull origin main
docker build -t projectdb-frontend:latest .
docker stop projectdb-frontend && docker rm projectdb-frontend
docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:latest

# View logs
docker logs -f projectdb-frontend
sudo tail -f /var/log/nginx/lencondb.ru-access.log

# Restart services
docker restart projectdb-frontend
sudo systemctl reload nginx

# Health checks
curl https://lencondb.ru/health
docker ps | grep projectdb-frontend
```

---

## CORS Configuration (Backend)

Ensure your backend allows requests from the frontend domain. In your backend Express configuration:

```javascript
// Backend CORS configuration example
const cors = require('cors');

app.use(cors({
  origin: [
    'https://lencondb.ru',
    'https://www.lencondb.ru',
    'http://localhost:5173' // for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Post-Deployment Checklist

- [ ] Frontend is accessible at https://lencondb.ru
- [ ] SSL certificate is valid and auto-renewing
- [ ] API calls to backend are working
- [ ] All routes in the SPA are functioning
- [ ] Static assets are loading correctly
- [ ] WebSocket connections work (if applicable)
- [ ] Error pages display correctly
- [ ] Health check endpoint responds
- [ ] Container auto-restarts on failure
- [ ] Logs are being written correctly
- [ ] Firewall rules are configured
- [ ] Backup strategy is in place
- [ ] Monitoring is set up

---

## Support

For issues or questions:
1. Check container logs: `docker logs projectdb-frontend`
2. Check nginx logs: `sudo tail -f /var/log/nginx/lencondb.ru-error.log`
3. Verify configuration: `sudo nginx -t`
4. Review this deployment guide

---

**Last Updated:** October 2024
