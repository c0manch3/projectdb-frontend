# Quick Deployment Reference

Fast reference guide for deploying ProjectDB Frontend to production.

## Prerequisites Checklist
- [ ] Server: 209.38.74.75 with Docker installed
- [ ] Domain: lencondb.ru pointing to server IP
- [ ] SSH access configured
- [ ] Nginx installed on server
- [ ] SSL certificate obtained (Let's Encrypt)

---

## Option 1: Automated Deployment (Recommended)

### Single Command Deployment
```bash
./scripts/deploy.sh
```

That's it! The script will:
- Run all tests and checks
- Build the application
- Upload to server
- Deploy with Docker
- Verify deployment

---

## Option 2: Manual Deployment

### On Your Local Machine
```bash
# 1. Build and test
npm run test && npm run build

# 2. Create deployment archive
tar -czf deploy.tar.gz --exclude='node_modules' --exclude='.git' .

# 3. Upload to server
scp deploy.tar.gz root@209.38.74.75:/tmp/
```

### On the Server
```bash
# 1. Connect to server
ssh root@209.38.74.75

# 2. Extract files
cd /opt/projectdb-frontend
tar -xzf /tmp/deploy.tar.gz
rm /tmp/deploy.tar.gz

# 3. Deploy with Docker
docker build -t projectdb-frontend:latest .
docker stop projectdb-frontend 2>/dev/null || true
docker rm projectdb-frontend 2>/dev/null || true
docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:latest

# 4. Verify
docker ps | grep projectdb-frontend
curl http://localhost:8080/health
```

---

## Option 3: Docker Compose

### On the Server
```bash
cd /opt/projectdb-frontend
docker-compose up -d
docker-compose logs -f
```

---

## First-Time Server Setup

### 1. Install Docker
```bash
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
```bash
# Copy the nginx configuration from DEPLOYMENT.md
sudo nano /etc/nginx/sites-available/lencondb.ru
sudo ln -s /etc/nginx/sites-available/lencondb.ru /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Common Commands

### Check Status
```bash
# Container status
docker ps | grep projectdb-frontend

# View logs
docker logs -f projectdb-frontend

# Health check
curl https://lencondb.ru/health
```

### Restart Services
```bash
# Restart container
docker restart projectdb-frontend

# Restart nginx
sudo systemctl reload nginx
```

### View Logs
```bash
# Container logs
docker logs projectdb-frontend

# Nginx logs
sudo tail -f /var/log/nginx/lencondb.ru-access.log
sudo tail -f /var/log/nginx/lencondb.ru-error.log
```

### Rollback
```bash
# Stop current container
docker stop projectdb-frontend
docker rm projectdb-frontend

# Start previous image
docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:previous

# Or restore from backup
cd /opt/projectdb-frontend/backup
docker build -t projectdb-frontend:latest .
docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:latest
```

---

## Troubleshooting Quick Fixes

### Container won't start
```bash
docker logs projectdb-frontend
docker restart projectdb-frontend
```

### 502 Bad Gateway
```bash
# Check if container is running
docker ps

# Check nginx
sudo nginx -t
sudo systemctl status nginx
```

### Can't access website
```bash
# Check DNS
nslookup lencondb.ru

# Check firewall
sudo ufw status

# Check nginx
curl http://localhost:8080
```

### SSL issues
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Post-Deployment Verification

```bash
# 1. Check website loads
curl -I https://lencondb.ru

# 2. Check health endpoint
curl https://lencondb.ru/health

# 3. Check container is running
docker ps | grep projectdb-frontend

# 4. Check SSL certificate
curl -vI https://lencondb.ru 2>&1 | grep "SSL certificate"

# 5. Check nginx configuration
sudo nginx -t
```

---

## Environment Variables

Update API URL in production:
```bash
# Edit .env.production locally before deploying
VITE_API_BASE_URL=http://209.38.74.75:3000
```

---

## CI/CD with GitHub Actions

### Setup GitHub Secrets
1. Go to GitHub repo → Settings → Secrets
2. Add secrets:
   - `SERVER_HOST`: 209.38.74.75
   - `SERVER_USER`: root
   - `SSH_PRIVATE_KEY`: Your private SSH key

### Trigger Deployment
```bash
# Push to main branch triggers automatic deployment
git push origin main
```

---

## Quick Links

- **Frontend:** https://lencondb.ru
- **Backend API:** http://209.38.74.75:3000
- **Health Check:** https://lencondb.ru/health
- **Full Documentation:** See DEPLOYMENT.md

---

## Emergency Contacts

If deployment fails:
1. Check container logs: `docker logs projectdb-frontend`
2. Check nginx logs: `sudo tail -f /var/log/nginx/lencondb.ru-error.log`
3. Review DEPLOYMENT.md for detailed troubleshooting
4. Rollback to previous version if needed

---

**Remember:** Always test locally before deploying to production!
