# 🔐 Authentication Quick Start

## ⚡ Test Your New Auth System in 5 Minutes

Your complete authentication system is **ready to test**! Follow these steps:

---

## Step 1: Start Development Server (30 seconds)

```bash
npm run dev
```

✅ Server starts at: http://localhost:3000

---

## Step 2: Test Registration (1 minute)

1. **Click "Sign Up"** button in navbar (top right)
   - Or visit: http://localhost:3000/auth/register

2. **Fill the registration form:**
   ```
   First Name: Test
   Last Name: User
   Email: test@example.com
   Username: testuser
   Password: TestPass123
   Confirm Password: TestPass123
   ☑️ I agree to the terms and conditions
   ```

3. **Click "Create Account"**

4. **Expected Result:**
   - ✅ "Registration successful!" message
   - ✅ Auto-redirect to login page
   - ✅ User created in Moodle

**⚠️ If it fails with "exception" error:**
- Moodle web services need configuration (see Step 5 below)

---

## Step 3: Test Login (30 seconds)

1. **You're at:** http://localhost:3000/auth/login

2. **Enter credentials:**
   ```
   Username: testuser
   Password: TestPass123
   ```

3. **Click "Sign In"**

4. **Expected Result:**
   - ✅ Redirect to dashboard
   - ✅ See welcome message: "Welcome back, Test User!"
   - ✅ Navbar shows orange avatar with "TU"
   - ✅ Stats cards display

---

## Step 4: Explore Features (2 minutes)

### ✅ Navbar User Menu
Click your **avatar** (top right orange circle):
- Dashboard
- My Courses  
- Profile
- Sign Out

### ✅ Dashboard Page
- Welcome message with your name
- 3 stats cards (Enrolled, Completed, In Progress)
- "My Courses" section
- "Browse All Courses" button

### ✅ My Courses Page
Click "My Courses" in dropdown:
- Filter tabs: All, Active, Completed
- Course list (if enrolled in any)
- "No courses yet" message (if none)

### ✅ Profile Page
Click "Profile" in dropdown:
- User avatar with your initials
- Profile information display
- "Edit Profile" button
- Click edit, change name, save
- See "Profile updated successfully"

### ✅ Test Protected Routes
1. Click "Sign Out"
2. Try visiting: http://localhost:3000/dashboard
3. You'll be redirected to login ✅
4. Login again
5. You'll be redirected back to dashboard ✅

### ✅ Test Session Persistence
1. Close all browser tabs
2. Open new tab: http://localhost:3000
3. You're still logged in! ✅

---

## Step 5: Configure Moodle (If Registration Failed)

### 🎯 Quick Moodle Setup (15 minutes)

#### 1. Enable Web Services
1. Login to Moodle as **admin**
   - https://srv1215874.hstgr.cloud/
2. Navigate to: **Site administration** → **Server** → **Web services** → **Overview**
3. Click **"Enable web services"** (if not already enabled)

#### 2. Enable REST Protocol
1. Go to: **Site administration** → **Server** → **Web services** → **Manage protocols**
2. **Enable** "REST protocol"

#### 3. Create/Configure Service
1. Go to: **Site administration** → **Server** → **Web services** → **External services**
2. Either:
   - Edit existing service, or
   - Click "Add" to create new service
3. **Add these functions:**
   ```
   ✓ core_user_create_users       (registration)
   ✓ core_webservice_get_site_info (login)
   ✓ core_user_get_users_by_field  (profile)
   ✓ core_enrol_get_users_courses  (courses)
   ```

#### 4. Enable Manual Authentication
1. Go to: **Site administration** → **Plugins** → **Authentication** → **Manage authentication**
2. **Enable** "Manual accounts"

#### 5. Verify Token Permissions
1. Go to: **Site administration** → **Server** → **Web services** → **Manage tokens**
2. Find your token: `1614ba5ec36870b093fb070dda4e5b0e`
3. Click user associated with token
4. Verify capabilities:
   ```
   ✓ moodle/user:create
   ✓ moodle/user:update
   ✓ moodle/user:viewdetails
   ✓ webservice/rest:use
   ```

#### 6. Test Registration Again
Go back to your app and try registering again. Should work now! 🎉

---

## 🎯 What's Working

| Feature | Status | Test It |
|---------|--------|---------|
| User Registration | ✅ Ready | /auth/register |
| User Login | ✅ Ready | /auth/login |
| Dashboard | ✅ Ready | /dashboard |
| My Courses | ✅ Ready | /my-courses |
| Profile View/Edit | ✅ Ready | /profile |
| Protected Routes | ✅ Ready | Try accessing without login |
| Session Persistence | ✅ Ready | Close/reopen browser |
| User Dropdown Menu | ✅ Ready | Click avatar |
| Logout | ✅ Ready | Click Sign Out |
| Dark Mode | ✅ Ready | Toggle theme |
| Mobile Responsive | ✅ Ready | Test on mobile |

---

## 🔧 Environment Check

Your `.env.local` should have:

```bash
MOODLE_URL=https://srv1215874.hstgr.cloud/
MOODLE_TOKEN=1614ba5ec36870b093fb070dda4e5b0e
NEXTAUTH_SECRET=prem-mcx-lms-secret-key-2024-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_MOODLE_URL=https://srv1215874.hstgr.cloud/
```

✅ All variables are configured!

---

## 🐛 Troubleshooting

### "Invalid credentials" on login
- ✅ Check username/password
- ✅ Verify user exists in Moodle
- ✅ Try logging into Moodle directly first

### "Exception" on registration
- ⚠️ Moodle web services not configured
- 👉 Follow Step 5 above
- ✅ Enable `core_user_create_users` function

### Session lost after refresh
- ✅ Check `NEXTAUTH_SECRET` is set
- ✅ Restart dev server: `Ctrl+C` then `npm run dev`
- ✅ Clear cookies and try again

### Dashboard shows no courses
- ✅ **Normal!** User hasn't enrolled yet
- 👉 Login to Moodle and enroll in a course
- ✅ Refresh dashboard page

### Protected routes not redirecting
- ✅ Restart dev server
- ✅ Clear browser cookies
- ✅ Try incognito/private window

---

## 📚 Full Documentation

| Guide | Purpose | Read Time |
|-------|---------|-----------|
| **[AUTH_QUICKSTART.md](AUTH_QUICKSTART.md)** | ⭐ This file - Fast testing | 5 min |
| **[SUMMARY.md](SUMMARY.md)** | Complete overview | 10 min |
| **[AUTHENTICATION.md](AUTHENTICATION.md)** | Detailed configuration | 20 min |
| **[TESTING.md](TESTING.md)** | Comprehensive testing | 15 min |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design & flow | 15 min |

---

## 🎉 You're All Set!

### ✅ Files Created (10 new)
- Login page
- Register page
- Dashboard page
- My Courses page
- Profile page
- NextAuth config
- Registration API
- Session provider
- Middleware
- TypeScript types

### ✅ Files Updated (3)
- Layout (SessionProvider)
- Navbar (User menu)
- Environment variables

### ✅ Features Working
- Complete authentication flow
- Protected routes
- Session management
- User profile
- Course integration
- Responsive design

---

## 🚀 Next Actions

### For Testing (Now)
1. ✅ Follow Steps 1-4 above
2. ✅ Test all features
3. ✅ Configure Moodle (if needed)

### For Development (Later)
1. Read [AUTHENTICATION.md](AUTHENTICATION.md) for customization
2. Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. Follow [TESTING.md](TESTING.md) for comprehensive testing

### For Production (When Ready)
1. Generate secure secret:
   ```bash
   openssl rand -base64 32
   ```
2. Update production environment variables
3. Build and deploy

---

## 💡 Pro Tips

- **Always restart server** after changing `.env.local`
- **Use browser DevTools** to see API requests
- **Check Moodle logs** if issues persist
- **Clear cookies** if session problems
- **Test mobile view** - it's fully responsive!

---

## 🎯 Quick Reference

### Important URLs
```
Home:       http://localhost:3000
Login:      http://localhost:3000/auth/login
Register:   http://localhost:3000/auth/register
Dashboard:  http://localhost:3000/dashboard
Courses:    http://localhost:3000/my-courses
Profile:    http://localhost:3000/profile
```

### Test Credentials (After Registration)
```
Username: testuser
Password: TestPass123
```

---

**Ready? Run `npm run dev` and start testing!** 🚀
