# Production Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

---

## Phase 1: Pre-Deployment Preparation

### Local Development
- [ ] All features are complete and tested
- [ ] Code is committed to Git
- [ ] Working on the correct branch (development or main)

### Testing
- [ ] Unit tests pass: `npm run test`
- [ ] TypeScript compilation succeeds: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Production build succeeds: `npm run build`
- [ ] Preview build works: `npm run preview`

### Configuration
- [ ] `.env.production` file is configured correctly
- [ ] API_BASE_URL points to correct backend: `http://209.38.74.75:3000`
- [ ] All environment variables are set
- [ ] Verified `src/services/api.ts` uses environment variable

### Documentation Review
- [ ] Read `DEPLOYMENT.md` (full guide)
- [ ] Read `QUICK_DEPLOY.md` (quick reference)
- [ ] Read `CORS_CONFIGURATION.md` (backend setup)
- [ ] Read `DEPLOYMENT_SUMMARY.md` (overview)

---

## Phase 2: Server Setup (First-Time Only)

### Server Access
- [ ] Can SSH into server: `ssh root@209.38.74.75`
- [ ] Server is running Ubuntu 20.04+ or similar
- [ ] Have root or sudo access

### Install Required Software
- [ ] Docker installed: `docker --version`
- [ ] Docker Compose installed: `docker-compose --version`
- [ ] Nginx installed: `nginx -v`
- [ ] Certbot installed: `certbot --version`

### Firewall Configuration
- [ ] UFW firewall is configured
- [ ] Port 22 (SSH) is open
- [ ] Port 80 (HTTP) is open
- [ ] Port 443 (HTTPS) is open
- [ ] Port 3000 (Backend API) is open
- [ ] Firewall is enabled: `sudo ufw status`

### Domain Configuration
- [ ] Domain `lencondb.ru` is purchased
- [ ] DNS A record points to `209.38.74.75`
- [ ] DNS has propagated: `nslookup lencondb.ru`
- [ ] Optional: www subdomain also points to server

### SSL Certificate
- [ ] SSL certificate obtained: `sudo certbot --nginx -d lencondb.ru -d www.lencondb.ru`
- [ ] Certificate is valid: `sudo certbot certificates`
- [ ] Auto-renewal is configured: `sudo certbot renew --dry-run`

### Nginx Configuration
- [ ] Nginx reverse proxy configured for frontend
- [ ] Configuration file created: `/etc/nginx/sites-available/lencondb.ru`
- [ ] Configuration file enabled: symlink in `/etc/nginx/sites-enabled/`
- [ ] Default site disabled: removed `/etc/nginx/sites-enabled/default`
- [ ] Nginx configuration is valid: `sudo nginx -t`
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] Nginx is set to start on boot: `sudo systemctl is-enabled nginx`

### Directory Structure
- [ ] Project directory created: `/opt/projectdb-frontend`
- [ ] Proper permissions set: `sudo chown -R $USER:$USER /opt/projectdb-frontend`

---

## Phase 3: Backend Configuration

### Backend API Status
- [ ] Backend is running: `curl http://209.38.74.75:3000/health`
- [ ] Backend is accessible from outside
- [ ] Backend endpoints are working correctly

### CORS Configuration
- [ ] Read `CORS_CONFIGURATION.md`
- [ ] CORS allows `https://lencondb.ru` origin
- [ ] CORS allows `https://www.lencondb.ru` origin
- [ ] CORS allows credentials if needed
- [ ] CORS allows required methods: GET, POST, PUT, DELETE, PATCH
- [ ] CORS allows required headers: Content-Type, Authorization
- [ ] Tested CORS with curl or browser console

### WebSocket Configuration (if applicable)
- [ ] Socket.io CORS configured
- [ ] WebSocket connection tested
- [ ] WebSocket works from production domain

---

## Phase 4: Initial Deployment

### Choose Deployment Method

#### Option A: Automated Deployment Script (Recommended)
- [ ] Made script executable: `chmod +x scripts/deploy.sh`
- [ ] Updated SERVER_USER in script if needed
- [ ] Updated SERVER_HOST in script if needed
- [ ] Updated SERVER_PATH in script if needed
- [ ] Run deployment: `./scripts/deploy.sh`

#### Option B: Manual Deployment
- [ ] Created deployment archive: `tar -czf deploy.tar.gz ...`
- [ ] Uploaded to server: `scp deploy.tar.gz root@209.38.74.75:/tmp/`
- [ ] SSH'd to server and extracted files
- [ ] Built Docker image: `docker build -t projectdb-frontend:latest .`
- [ ] Started container: `docker run -d --name projectdb-frontend ...`

#### Option C: Docker Compose
- [ ] Uploaded files to server
- [ ] Started services: `docker-compose up -d`

---

## Phase 5: Post-Deployment Verification

### Automated Verification
- [ ] Run health check script: `./scripts/check-health.sh`

### Manual Verification

#### Docker Container
- [ ] Container is running: `docker ps | grep projectdb-frontend`
- [ ] Container is healthy: Check STATUS column shows "healthy"
- [ ] Container logs show no errors: `docker logs projectdb-frontend`
- [ ] Container restarts automatically: Check RESTART policy

#### Website Accessibility
- [ ] Website loads via HTTP: `curl http://lencondb.ru`
- [ ] Website redirects to HTTPS
- [ ] Website loads via HTTPS: `curl https://lencondb.ru`
- [ ] www subdomain works: `curl https://www.lencondb.ru`
- [ ] Health endpoint responds: `curl https://lencondb.ru/health`

#### SSL Certificate
- [ ] SSL certificate is valid: Check browser shows secure lock
- [ ] Certificate is for correct domain
- [ ] Certificate is not expired
- [ ] HTTPS redirect works

#### Application Functionality
- [ ] Homepage loads correctly
- [ ] All pages are accessible (test navigation)
- [ ] Static assets load (CSS, JS, images)
- [ ] API calls work (check browser console)
- [ ] Authentication works (login/logout)
- [ ] WebSocket connection works (if applicable)
- [ ] No console errors in browser

#### Performance
- [ ] Page load time is acceptable
- [ ] Images load quickly
- [ ] No significant lag or delays
- [ ] Gzip compression is working: Check response headers

#### Security Headers
- [ ] Strict-Transport-Security header present
- [ ] X-Frame-Options header present
- [ ] X-Content-Type-Options header present
- [ ] X-XSS-Protection header present
- [ ] Check with: `curl -I https://lencondb.ru`

#### Nginx
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] Nginx access logs show requests: `sudo tail /var/log/nginx/lencondb.ru-access.log`
- [ ] No errors in nginx logs: `sudo tail /var/log/nginx/lencondb.ru-error.log`

#### Resource Usage
- [ ] Server has sufficient disk space: `df -h`
- [ ] Server has sufficient memory: `free -h`
- [ ] Container isn't using excessive resources: `docker stats projectdb-frontend`

---

## Phase 6: CI/CD Setup (Optional)

### GitHub Actions

#### GitHub Secrets Configuration
- [ ] Go to GitHub repo → Settings → Secrets and variables → Actions
- [ ] Add secret: `SERVER_HOST` = `209.38.74.75`
- [ ] Add secret: `SERVER_USER` = `root` (or your username)
- [ ] Add secret: `SSH_PRIVATE_KEY` = Your SSH private key

#### Generate SSH Key (if needed)
- [ ] Generate SSH key: `ssh-keygen -t ed25519 -C "github-actions"`
- [ ] Add public key to server: `ssh-copy-id -i ~/.ssh/id_ed25519.pub root@209.38.74.75`
- [ ] Copy private key to GitHub secrets

#### Workflow Configuration
- [ ] GitHub Actions workflow file exists: `.github/workflows/deploy.yml`
- [ ] Workflow is enabled in GitHub repo settings
- [ ] Review workflow configuration

#### Test CI/CD
- [ ] Push a small change to main branch
- [ ] Check GitHub Actions tab for workflow run
- [ ] Verify deployment succeeds
- [ ] Check deployed website reflects changes

---

## Phase 7: Monitoring Setup

### Logging
- [ ] Container logs are accessible: `docker logs projectdb-frontend`
- [ ] Nginx logs are accessible: `sudo tail -f /var/log/nginx/lencondb.ru-access.log`
- [ ] Log rotation is configured: Check `/etc/logrotate.d/nginx`
- [ ] Logs are not filling up disk space: `du -sh /var/log/`

### Health Checks
- [ ] Health endpoint works: `https://lencondb.ru/health`
- [ ] Health check script works: `./scripts/check-health.sh`
- [ ] Setup monitoring service (optional): UptimeRobot, Pingdom, etc.

### Alerts (Optional)
- [ ] Setup uptime monitoring
- [ ] Setup SSL certificate expiry alerts
- [ ] Setup disk space alerts
- [ ] Setup error rate monitoring

---

## Phase 8: Backup Strategy

### Backup Configuration
- [ ] Backup Docker image: `docker save projectdb-frontend:latest | gzip > backup.tar.gz`
- [ ] Backup nginx configuration: `tar -czf nginx-backup.tar.gz /etc/nginx/`
- [ ] Backup SSL certificates: `sudo tar -czf ssl-backup.tar.gz /etc/letsencrypt/`
- [ ] Backup application files: `tar -czf app-backup.tar.gz /opt/projectdb-frontend/`

### Automated Backups (Optional)
- [ ] Create backup script
- [ ] Schedule with cron
- [ ] Test restoration process

---

## Phase 9: Documentation and Handoff

### Update Documentation
- [ ] Document any custom configuration changes
- [ ] Update README if needed
- [ ] Document any issues encountered and solutions

### Team Communication
- [ ] Notify team of deployment
- [ ] Share production URL: `https://lencondb.ru`
- [ ] Share access to logs and monitoring
- [ ] Document any known issues or limitations

### Knowledge Transfer
- [ ] Team knows how to deploy updates
- [ ] Team knows how to check logs
- [ ] Team knows how to rollback if needed
- [ ] Team knows how to access server

---

## Phase 10: Post-Launch Monitoring

### First 24 Hours
- [ ] Monitor error logs every few hours
- [ ] Check resource usage
- [ ] Monitor user feedback
- [ ] Fix any critical issues immediately

### First Week
- [ ] Daily health checks
- [ ] Review logs for errors
- [ ] Monitor performance metrics
- [ ] Address any issues

### First Month
- [ ] Weekly performance reviews
- [ ] SSL certificate check
- [ ] Security updates applied
- [ ] Backup verification

---

## Rollback Plan (In Case of Issues)

### Quick Rollback Steps
- [ ] SSH to server: `ssh root@209.38.74.75`
- [ ] Stop current container: `docker stop projectdb-frontend`
- [ ] Remove current container: `docker rm projectdb-frontend`
- [ ] Restore from backup:
  ```bash
  cd /opt/projectdb-frontend/backup
  docker build -t projectdb-frontend:latest .
  docker run -d --name projectdb-frontend --restart unless-stopped -p 8080:80 projectdb-frontend:latest
  ```
- [ ] Verify rollback: Check website loads correctly

---

## Common Issues and Solutions

### Issue: Container won't start
**Check:**
```bash
docker logs projectdb-frontend
docker inspect projectdb-frontend
```
**Solution:** Review logs, rebuild image, check for port conflicts

### Issue: 502 Bad Gateway
**Check:**
```bash
docker ps | grep projectdb-frontend
sudo nginx -t
```
**Solution:** Verify container is running, check nginx proxy configuration

### Issue: SSL errors
**Check:**
```bash
sudo certbot certificates
sudo nginx -t
```
**Solution:** Renew certificate, check nginx SSL configuration

### Issue: Can't connect to backend
**Check:**
```bash
curl http://209.38.74.75:3000/health
```
**Solution:** Configure CORS on backend (see CORS_CONFIGURATION.md)

---

## Maintenance Schedule

### Daily
- [ ] Quick website check (5 minutes)
- [ ] Review critical error logs

### Weekly
- [ ] Full health check: `./scripts/check-health.sh`
- [ ] Review all logs
- [ ] Check disk space
- [ ] Check container resource usage

### Monthly
- [ ] Update dependencies: `npm audit`
- [ ] Apply security updates
- [ ] Verify backups
- [ ] Review SSL certificate expiry
- [ ] Review performance metrics
- [ ] Update documentation if needed

---

## Emergency Contacts

### Server Issues
- Server provider support
- System administrator contact

### Application Issues
- Development team lead
- DevOps engineer
- Backend team (for API issues)

### Third-Party Services
- Domain registrar
- SSL certificate provider (Let's Encrypt)
- Monitoring service

---

## Success Criteria

Deployment is successful when:
- ✅ Website is accessible at https://lencondb.ru
- ✅ SSL certificate is valid
- ✅ All application features work
- ✅ API calls succeed
- ✅ No errors in logs
- ✅ Performance is acceptable
- ✅ Health checks pass
- ✅ Monitoring is in place
- ✅ Team is informed
- ✅ Documentation is updated

---

## Notes

Use this space to document any issues, solutions, or important information discovered during deployment:

```
Date: _______________
Issue:






Solution:






```

---

**Deployment Checklist Version:** 1.0
**Last Updated:** October 14, 2024
**Status:** Ready for Production Deployment
