# 🚀 Deployment Checklist

Use this checklist when deploying LiquidGlass LMS to production.

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Create `.env.local` or configure production environment variables
- [ ] Set `MOODLE_URL` (without trailing slash)
- [ ] Set `MOODLE_TOKEN` (valid web service token)
- [ ] Test Moodle connection locally

### 2. Code Quality
- [ ] Run `npm run build` to check for build errors
- [ ] Run `npm run lint` to check for linting issues
- [ ] Test all pages locally
- [ ] Test dark mode
- [ ] Test responsive design (mobile, tablet, desktop)

### 3. Security
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Never commit Moodle token to git
- [ ] Use HTTPS for Moodle URL
- [ ] Rotate Moodle token regularly
- [ ] Set up proper CORS if needed

### 4. Performance
- [ ] Test with real Moodle data
- [ ] Check API response times
- [ ] Verify image optimization
- [ ] Test with slow network

## 🎯 Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Prepare Repository
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - LiquidGlass LMS"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/lms-liquid-glass.git
git push -u origin main
```

#### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables:
   ```
   MOODLE_URL=https://your-moodle-site.com
   MOODLE_TOKEN=your_production_token
   ```
6. Click "Deploy"
7. Wait for deployment (usually 2-3 minutes)

#### Step 3: Verify Deployment
- [ ] Visit your Vercel URL
- [ ] Test homepage loads
- [ ] Test courses page
- [ ] Test course detail page
- [ ] Test settings page
- [ ] Verify Moodle data loads correctly

#### Step 4: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Option 2: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables
netlify env:set MOODLE_URL "https://your-moodle-site.com"
netlify env:set MOODLE_TOKEN "your_token"

# Deploy
netlify deploy --prod
```

### Option 3: Deploy to Your Own Server

#### Requirements
- Node.js 20+
- PM2 or similar process manager
- Nginx or similar reverse proxy

#### Steps

1. **Clone repository on server:**
```bash
git clone https://github.com/yourusername/lms-liquid-glass.git
cd lms-liquid-glass
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env.local`:**
```bash
nano .env.local
# Add your MOODLE_URL and MOODLE_TOKEN
```

4. **Build application:**
```bash
npm run build
```

5. **Start with PM2:**
```bash
npm install -g pm2
pm2 start npm --name "lms" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable SSL with Let's Encrypt:**
```bash
sudo certbot --nginx -d yourdomain.com
```

## 🔧 Post-Deployment

### 1. Configure Moodle
- [ ] Whitelist your deployment domain in Moodle CORS settings
- [ ] Test web service functions are accessible
- [ ] Monitor Moodle logs for errors

### 2. Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor API response times
- [ ] Track user analytics
- [ ] Set up uptime monitoring

### 3. Documentation
- [ ] Update README with production URL
- [ ] Document any custom configurations
- [ ] Create user guide if needed

## 🐛 Troubleshooting

### Issue: "Moodle is not configured"
**Solution:** 
- Check environment variables are set correctly
- Restart application after changing env vars

### Issue: CORS errors
**Solution:**
- Add your deployment domain to Moodle's allowed origins
- Check web service settings in Moodle

### Issue: Build fails
**Solution:**
- Run `npm run build` locally first
- Check for TypeScript errors
- Ensure all dependencies are installed

### Issue: Slow performance
**Solution:**
- Check Moodle server response time
- Enable caching in Moodle
- Consider CDN for static assets

## 📊 Performance Optimization

### 1. Enable Caching
```typescript
// Already implemented in API routes
fetch(url, { next: { revalidate: 300 } }) // 5 min cache
```

### 2. Image Optimization
- Images are optimized via Next.js Image component
- Consider serving images from CDN

### 3. Database Indexing
- Ensure Moodle database is properly indexed
- Monitor slow queries

### 4. CDN Setup (Optional)
- Use Vercel Edge Network (automatic on Vercel)
- Or configure CloudFlare CDN

## 🔒 Security Hardening

### 1. Environment Variables
- [ ] Never expose Moodle token in client code
- [ ] Use different tokens for dev/staging/prod
- [ ] Rotate tokens regularly

### 2. API Security
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Monitor for suspicious activity

### 3. HTTPS
- [ ] Force HTTPS redirect
- [ ] Use HSTS headers
- [ ] Valid SSL certificate

### 4. Moodle Security
- [ ] Keep Moodle updated
- [ ] Review web service permissions
- [ ] Monitor access logs

## 📈 Scaling Considerations

### For High Traffic:
- [ ] Enable Redis caching
- [ ] Use load balancer
- [ ] Consider database read replicas
- [ ] Implement request queuing

### For Multiple Instances:
- [ ] Use shared session storage
- [ ] Centralized logging
- [ ] Distributed caching

## 🎉 Launch Checklist

### Final Steps Before Going Live:
- [ ] Test all features with real users
- [ ] Update metadata (title, description)
- [ ] Add favicon and app icons
- [ ] Create sitemap.xml
- [ ] Set up Google Analytics (optional)
- [ ] Prepare user documentation
- [ ] Create support email/system
- [ ] Announce launch! 🚀

## 📞 Support

If you encounter issues:
1. Check the logs (Vercel Dashboard or server logs)
2. Review Moodle web service logs
3. Test API endpoints directly
4. Check network connectivity

## 🎊 Congratulations!

Your LiquidGlass LMS is now live and ready to serve students! 🎓✨

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URL:** _______________  
**Moodle Version:** _______________  
