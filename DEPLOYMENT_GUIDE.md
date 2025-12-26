# 🚀 Deployment Guide - Prem MCX LMS

## Complete guide to deploy your Next.js frontend with Moodle backend integration

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Hostinger account with Moodle installed
- ✅ Moodle server running (https://srv1215874.hstgr.cloud/)
- ✅ Moodle Web Services enabled
- ✅ Moodle API token (1614ba5ec36870b093fb070dda4e5b0e)
- ✅ Node.js 18+ installed locally
- ✅ Git installed

---

## 🎯 Deployment Options

### **Option 1: Vercel (Recommended - Easiest)**
### **Option 2: Hostinger Node.js Hosting**
### **Option 3: Netlify**
### **Option 4: Self-Hosted on Hostinger VPS**

---

## ⚡ Option 1: Deploy to Vercel (RECOMMENDED)

Vercel is the easiest and most optimized for Next.js applications.

### Step 1: Create Vercel Account
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Prepare Your Project
```bash
# Make sure you're in project directory
cd d:\lms-liquid-glass

# Install dependencies
npm install

# Test build locally
npm run build
```

### Step 3: Deploy
```bash
# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? prem-mcx-lms (or your choice)
# - Directory? ./ (press Enter)
# - Override settings? No
```

### Step 4: Configure Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Settings" → "Environment Variables"
4. Add these variables:

```env
MOODLE_URL=https://srv1215874.hstgr.cloud/
MOODLE_TOKEN=1614ba5ec36870b093fb070dda4e5b0e
```

5. Click "Deploy" to redeploy with new variables

### Step 5: Deploy to Production
```bash
# Deploy to production
vercel --prod
```

**Your site will be live at: `https://prem-mcx-lms.vercel.app`**

### Custom Domain (Optional)
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., academy.yoursite.com)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

---

## 🌐 Option 2: Hostinger Node.js Hosting

If you want to host on Hostinger alongside your Moodle:

### Step 1: Check Hostinger Plan
- You need **Business** or **Cloud** hosting plan
- VPS or Cloud hosting is recommended for Node.js

### Step 2: Enable Node.js in Hostinger
1. Login to Hostinger hPanel
2. Go to "Advanced" → "Node.js"
3. Click "Create Application"
4. Select Node.js version: **18.x or higher**

### Step 3: Upload Your Project

**Option A: Using Git (Recommended)**
```bash
# On Hostinger, enable Git deployment
# 1. Go to hPanel → Advanced → SSH Access
# 2. Create SSH key
# 3. Add to your Git repository

# Connect via SSH
ssh username@your-server-ip

# Clone your repository
cd domains/yourdomain.com/public_html
git clone https://github.com/yourusername/lms-liquid-glass.git
cd lms-liquid-glass

# Install dependencies
npm install

# Build the project
npm run build
```

**Option B: Using FTP**
```bash
# Build locally first
npm run build

# Upload these folders via FTP:
# - .next/
# - public/
# - node_modules/ (or run npm install on server)
# - package.json
# - next.config.ts
```

### Step 4: Configure Environment Variables
```bash
# Create .env.local on server
nano .env.local

# Add:
MOODLE_URL=https://srv1215874.hstgr.cloud/
MOODLE_TOKEN=1614ba5ec36870b093fb070dda4e5b0e
```

### Step 5: Start Application
```bash
# In Hostinger Node.js settings:
# Application Root: /path/to/lms-liquid-glass
# Application URL: yourdomain.com or subdomain.yourdomain.com
# Application Startup File: npm start
# Node.js version: 18.x

# Or manually start with PM2:
npm install -g pm2
pm2 start npm --name "lms" -- start
pm2 save
pm2 startup
```

### Step 6: Configure Reverse Proxy
In Hostinger hPanel:
1. Go to "Advanced" → "Apache Configuration" or "Nginx"
2. Add proxy rule:

```apache
# For Apache
<VirtualHost *:80>
    ServerName yourdomain.com
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    ProxyPreserveHost On
</VirtualHost>
```

---

## 🔗 Connecting to Your Moodle Server

Your Moodle is already configured! Here's how to verify and optimize:

### Step 1: Verify Moodle Web Services

1. **Login to Moodle Admin Panel**
   - URL: https://srv1215874.hstgr.cloud/admin
   - Login with your admin credentials

2. **Enable Web Services**
   ```
   Site administration → Server → Web services → Overview
   ```
   Check all items are enabled:
   - ✅ Enable web services
   - ✅ Enable protocols (REST protocol)
   - ✅ Create a specific user
   - ✅ Check user capability
   - ✅ Select a service
   - ✅ Add functions
   - ✅ Select a specific user
   - ✅ Create a token for user

3. **Verify Your Token**
   ```
   Site administration → Server → Web services → Manage tokens
   ```
   Find token: `1614ba5ec36870b093fb070dda4e5b0e`
   Ensure it has these capabilities:
   - ✅ webservice/rest:use
   - ✅ moodle/course:view
   - ✅ moodle/course:viewhiddencourses
   - ✅ moodle/user:viewdetails

### Step 2: Test Moodle Connection

Create a test script to verify connection:

```bash
# Test from command line
curl "https://srv1215874.hstgr.cloud/webservice/rest/server.php?wstoken=1614ba5ec36870b093fb070dda4e5b0e&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json"
```

**Expected Response:**
```json
{
  "sitename": "Your Moodle Site",
  "username": "admin",
  "userid": 2,
  ...
}
```

### Step 3: Configure CORS (If Needed)

If you get CORS errors, add this to Moodle config:

1. Edit Moodle `config.php`:
```php
// Add before the last line
$CFG->wwwroot = 'https://srv1215874.hstgr.cloud';

// Allow your frontend domain
header('Access-Control-Allow-Origin: https://your-frontend-domain.com');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
```

**Better approach**: Use Moodle's built-in CORS settings:
```
Site administration → Security → HTTP security
→ CORS allowed origins: https://your-frontend-domain.com
```

### Step 4: Test API Routes

After deployment, test these endpoints:

1. **Get Site Info**
   ```
   https://your-deployed-site.com/api/moodle?action=siteinfo
   ```

2. **Get Courses**
   ```
   https://your-deployed-site.com/api/moodle?action=courses
   ```

3. **Get Course Content**
   ```
   https://your-deployed-site.com/api/moodle?action=course-contents&courseid=1
   ```

---

## 🔐 Security Best Practices

### 1. Secure Environment Variables
```bash
# NEVER commit .env.local to Git
echo ".env.local" >> .gitignore

# Use different tokens for development and production
# Generate new token in Moodle for production
```

### 2. Enable HTTPS
- Vercel: Automatic HTTPS
- Hostinger: Enable SSL in hPanel → SSL/TLS

### 3. Rate Limiting
Add rate limiting to API routes:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### 4. Secure API Routes
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Block direct API access from unauthorized domains
  const allowedOrigins = [
    'https://your-frontend-domain.com',
    'http://localhost:3000'
  ];
  
  const origin = request.headers.get('origin');
  
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 📊 Post-Deployment Checklist

### Essential Tests
- [ ] Homepage loads correctly
- [ ] Courses page shows Moodle courses
- [ ] Course detail pages work
- [ ] Cart functionality works
- [ ] Theme toggle works (light/dark mode)
- [ ] Mobile responsive design
- [ ] All images load
- [ ] API routes return data
- [ ] CORS configured correctly

### Performance Optimization
- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images (WebP format)
- [ ] Enable compression
- [ ] Monitor API response times

### SEO Setup
- [ ] Add sitemap.xml
- [ ] Configure robots.txt
- [ ] Add meta tags
- [ ] Submit to Google Search Console
- [ ] Add structured data (Schema.org)

---

## 🛠️ Troubleshooting

### Issue: "Failed to fetch courses"

**Solution 1: Check Moodle Token**
```bash
# Verify token in Moodle admin
Site administration → Web services → Manage tokens
```

**Solution 2: Check Web Service Functions**
```
Required functions:
- core_webservice_get_site_info
- core_course_get_courses
- core_course_get_contents
- core_enrol_get_enrolled_users
```

**Solution 3: Check CORS**
```php
// In Moodle config.php
$CFG->allowedorigins = ['https://your-frontend-domain.com'];
```

### Issue: "API route not found"

**Solution**: Ensure API routes are included in build:
```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['your-frontend-domain.com'],
    },
  },
};
```

### Issue: Dark mode not working

**Solution**: Clear browser cache and localStorage:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Issue: Slow API responses

**Solution**: Implement caching:
```typescript
// app/api/moodle/route.ts
export const revalidate = 300; // Cache for 5 minutes

// Or use React Query for client-side caching
```

---

## 📱 Mobile App Deployment (Optional)

### Convert to Progressive Web App (PWA)

1. **Install next-pwa**
```bash
npm install next-pwa
```

2. **Configure next.config.ts**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Your Next.js config
});
```

3. **Create manifest.json**
```json
{
  "name": "Prem MCX Academy",
  "short_name": "MCX Academy",
  "description": "Premier MCX Trading Academy",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🎯 Quick Start Deployment Commands

### Deploy to Vercel (Fastest)
```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy
cd d:\lms-liquid-glass
vercel --prod

# Add environment variables in Vercel dashboard
# Then redeploy
```

### Deploy to Hostinger
```bash
# Build locally
npm run build

# Upload via FTP or Git
# Configure Node.js app in hPanel
# Set environment variables
# Start application
```

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Moodle Web Services**: https://docs.moodle.org/dev/Web_services
- **Hostinger Support**: https://support.hostinger.com

---

## 🎉 Success!

Once deployed, your LMS will be live at:
- **Vercel**: https://your-project.vercel.app
- **Custom Domain**: https://academy.yoursite.com

Your users can now:
- ✅ Browse courses from Moodle
- ✅ View course content
- ✅ See enrolled students
- ✅ Switch between light/dark themes
- ✅ Add courses to cart
- ✅ Access on any device

---

## 📈 Next Steps After Deployment

1. **Set up Analytics**
   - Google Analytics 4
   - Vercel Analytics
   - Track conversions

2. **Configure Payments**
   - Integrate Razorpay
   - Test payment flow
   - Set up webhooks

3. **Add Authentication**
   - NextAuth.js with Moodle
   - User login/signup
   - Protected routes

4. **Email Notifications**
   - Purchase confirmations
   - Course enrollments
   - Password resets

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API performance
   - Set up uptime monitoring

**Your LMS is ready for production! 🚀**
