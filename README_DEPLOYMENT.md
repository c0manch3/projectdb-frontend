# Production Deployment - Quick Start

> **Complete production deployment solution for ProjectDB Frontend**

## Quick Overview

This repository contains a **production-ready deployment configuration** for deploying the React + TypeScript + Vite frontend to:
- **Server:** 209.38.74.75
- **Domain:** https://lencondb.ru
- **Backend API:** http://209.38.74.75:3000

---

## Files Created for Deployment

### Core Configuration
```
Dockerfile                    # Multi-stage Docker build
docker-compose.yml           # Docker Compose configuration
.dockerignore               # Docker build exclusions
.env.production             # Production environment variables
.env.example               # Environment variables template
```

### Nginx Configuration
```
nginx/
├── nginx.conf             # Main nginx configuration
├── default.conf          # Server block for frontend
└── ssl-params.conf       # SSL/TLS security settings
```

### Deployment Scripts
```
scripts/
├── deploy.sh             # Automated deployment script
└── check-health.sh      # Health check and verification script
```

### CI/CD
```
.github/workflows/
└── deploy.yml           # GitHub Actions workflow
```

### Documentation
```
DEPLOYMENT.md              # Complete deployment guide (15+ pages)
QUICK_DEPLOY.md           # Quick reference guide
CORS_CONFIGURATION.md     # Backend CORS setup guide
DEPLOYMENT_SUMMARY.md     # Architecture and overview
DEPLOYMENT_CHECKLIST.md   # Step-by-step checklist
README_DEPLOYMENT.md      # This file
```

---

## Deployment Methods

### Method 1: Automated Script (Easiest)
```bash
./scripts/deploy.sh
```
That's it! The script handles everything:
- Tests and validation
- Building the application
- Creating deployment archive
- Uploading to server
- Docker deployment
- Health verification

### Method 2: Manual Deployment
```bash
# 1. Build locally
npm run build

# 2. Create archive
tar -czf deploy.tar.gz --exclude='node_modules' --exclude='.git' .

# 3. Upload to server
scp deploy.tar.gz root@209.38.74.75:/tmp/

# 4. Deploy on server
ssh root@209.38.74.75
cd /opt/projectdb-frontend
tar -xzf /tmp/deploy.tar.gz
docker build -t projectdb-frontend:latest .
docker stop projectdb-frontend 2>/dev/null || true
docker rm projectdb-frontend 2>/dev/null || true
docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:latest
```

### Method 3: CI/CD with GitHub Actions
```bash
# Just push to main branch
git push origin main

# GitHub Actions automatically:
# - Runs tests
# - Builds application
# - Deploys to production
# - Verifies deployment
```

---

## First-Time Server Setup

If this is your first deployment, follow these steps:

### 1. Install Docker
```bash
ssh root@209.38.74.75
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Install Nginx
```bash
sudo apt update
sudo apt install -y nginx
```

### 3. Configure SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lencondb.ru -d www.lencondb.ru
```

### 4. Setup Nginx Reverse Proxy
Copy the nginx configuration from `DEPLOYMENT.md` and create:
```bash
sudo nano /etc/nginx/sites-available/lencondb.ru
# Paste configuration here

sudo ln -s /etc/nginx/sites-available/lencondb.ru /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configure Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

---

## Deployment Architecture

```
Users/Browsers
     ↓ HTTPS (443)
lencondb.ru (209.38.74.75)
     ↓
Nginx (SSL Termination + Reverse Proxy)
     ↓ HTTP (8080)
Docker Container: projectdb-frontend
     ↓ contains
Nginx (Static File Server) + React App
     ↓ HTTP API Calls
Backend API (209.38.74.75:3000)
```

---

## Verification Steps

After deployment, verify everything works:

### Automated Health Check
```bash
./scripts/check-health.sh
```

### Manual Checks
```bash
# 1. Website accessible
curl -I https://lencondb.ru

# 2. Health endpoint
curl https://lencondb.ru/health

# 3. Container running
ssh root@209.38.74.75 "docker ps | grep projectdb-frontend"

# 4. SSL valid
openssl s_client -servername lencondb.ru -connect lencondb.ru:443 </dev/null

# 5. No errors in logs
ssh root@209.38.74.75 "docker logs --tail 50 projectdb-frontend"
```

---

## Important: Backend CORS Configuration

**Your backend MUST be configured to allow requests from the frontend domain.**

See `CORS_CONFIGURATION.md` for detailed instructions.

Quick backend CORS setup (Express.js example):
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://lencondb.ru',
    'https://www.lencondb.ru',
    'http://localhost:5173'  // for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Common Issues and Quick Fixes

### Issue: Cannot access website
```bash
# Check DNS
nslookup lencondb.ru

# Check container
docker ps | grep projectdb-frontend

# Check nginx
sudo systemctl status nginx
```

### Issue: 502 Bad Gateway
```bash
# Check container is running
docker ps

# Check logs
docker logs projectdb-frontend
sudo tail -f /var/log/nginx/lencondb.ru-error.log
```

### Issue: Frontend can't connect to backend
```bash
# 1. Check backend is running
curl http://209.38.74.75:3000/health

# 2. Configure CORS on backend (see CORS_CONFIGURATION.md)

# 3. Check browser console for CORS errors
```

### Issue: SSL certificate errors
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew
sudo systemctl reload nginx
```

---

## Monitoring and Logs

### View Container Logs
```bash
ssh root@209.38.74.75
docker logs -f projectdb-frontend
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/lencondb.ru-access.log
sudo tail -f /var/log/nginx/lencondb.ru-error.log
```

### Check Container Stats
```bash
docker stats projectdb-frontend
```

---

## Updating the Deployment

### Method 1: Automated (Recommended)
```bash
# Make your changes, commit them, then:
./scripts/deploy.sh
```

### Method 2: CI/CD
```bash
git push origin main
# GitHub Actions handles the rest
```

### Method 3: Manual
```bash
# On server
ssh root@209.38.74.75
cd /opt/projectdb-frontend
git pull origin main
docker build -t projectdb-frontend:latest .
docker stop projectdb-frontend && docker rm projectdb-frontend
docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:latest
```

---

## Rollback Procedure

If something goes wrong:
```bash
ssh root@209.38.74.75
cd /opt/projectdb-frontend/backup

# Rebuild from backup
docker build -t projectdb-frontend:latest .
docker stop projectdb-frontend && docker rm projectdb-frontend
docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:latest
```

---

## Documentation Guide

Read the documentation in this order:

1. **README_DEPLOYMENT.md** (this file) - Quick overview
2. **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist
3. **QUICK_DEPLOY.md** - Quick reference commands
4. **DEPLOYMENT.md** - Complete guide with all details
5. **CORS_CONFIGURATION.md** - Backend CORS setup
6. **DEPLOYMENT_SUMMARY.md** - Architecture overview

---

## CI/CD Setup (GitHub Actions)

### 1. Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "github-actions"
```

### 2. Add Public Key to Server
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@209.38.74.75
```

### 3. Add GitHub Secrets
Go to: GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:
- **SERVER_HOST**: `209.38.74.75`
- **SERVER_USER**: `root`
- **SSH_PRIVATE_KEY**: Contents of `~/.ssh/id_ed25519`

### 4. Enable GitHub Actions
The workflow file is already created at `.github/workflows/deploy.yml`

### 5. Test
```bash
git push origin main
# Check GitHub Actions tab for workflow status
```

---

## Security Best Practices

✅ **Implemented:**
- HTTPS with valid SSL certificate
- HTTP to HTTPS redirect
- Security headers (HSTS, X-Frame-Options, etc.)
- Docker container isolation
- Gzip compression
- Static asset caching
- Non-root user in container

⚠️ **Recommended:**
- Enable fail2ban for brute force protection
- Setup log rotation
- Configure automated backups
- Setup uptime monitoring
- Regular security updates
- Environment variables for secrets

---

## Performance Optimizations

✅ **Built-in:**
- Multi-stage Docker build (smaller images)
- Code splitting (vendor, router, UI chunks)
- Gzip compression for text files
- 1-year browser caching for static assets
- HTTP/2 support
- Resource limits on container

---

## Support and Resources

### Documentation Files
- `DEPLOYMENT.md` - Complete guide
- `QUICK_DEPLOY.md` - Quick reference
- `CORS_CONFIGURATION.md` - CORS setup
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `DEPLOYMENT_SUMMARY.md` - Overview

### Useful Commands
```bash
# Health check
./scripts/check-health.sh

# Deploy
./scripts/deploy.sh

# Check logs
docker logs -f projectdb-frontend

# Check status
docker ps | grep projectdb-frontend

# Restart
docker restart projectdb-frontend
```

### Troubleshooting
1. Check logs first: `docker logs projectdb-frontend`
2. Verify container is running: `docker ps`
3. Check nginx: `sudo systemctl status nginx`
4. Review documentation: `DEPLOYMENT.md`

---

## Production URLs

- **Frontend:** https://lencondb.ru
- **Backend API:** http://209.38.74.75:3000
- **Health Check:** https://lencondb.ru/health

---

## Quick Command Reference

```bash
# Deploy
./scripts/deploy.sh

# Health check
./scripts/check-health.sh

# View logs
docker logs -f projectdb-frontend

# Restart container
docker restart projectdb-frontend

# Restart nginx
sudo systemctl reload nginx

# Check status
docker ps | grep projectdb-frontend

# SSH to server
ssh root@209.38.74.75

# View nginx logs
sudo tail -f /var/log/nginx/lencondb.ru-access.log

# Renew SSL
sudo certbot renew
```

---

## Status

✅ **Ready for Production Deployment**

All configuration files, scripts, and documentation have been created. The solution is production-ready and follows DevOps best practices.

---

## Next Steps

1. Review `DEPLOYMENT_CHECKLIST.md`
2. Setup server (first-time only)
3. Configure backend CORS
4. Run `./scripts/deploy.sh`
5. Verify deployment with health checks
6. Setup CI/CD (optional)
7. Configure monitoring (optional)

---

**Need Help?**
- Check the troubleshooting section in `DEPLOYMENT.md`
- Review logs: `docker logs projectdb-frontend`
- Run health checks: `./scripts/check-health.sh`

---

**Version:** 1.0
**Created:** October 14, 2024
**Status:** Production Ready ✅
