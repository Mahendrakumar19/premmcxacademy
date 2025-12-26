# Testing Checklist

## ✅ Pre-Flight Checks

- [x] NextAuth.js installed
- [x] Environment variables configured (.env.local)
- [x] All auth files created
- [ ] Moodle web services configured
- [ ] Dev server running

---

## 🧪 Test Sequence

### 1. Environment Setup
```bash
# Verify environment variables
cat .env.local

# Should show:
# ✅ MOODLE_URL
# ✅ MOODLE_TOKEN
# ✅ NEXTAUTH_SECRET
# ✅ NEXTAUTH_URL
```

### 2. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

### 3. Test Registration

1. Navigate to: http://localhost:3000/auth/register
2. Fill form:
   ```
   First Name: Test
   Last Name: User
   Email: test@example.com
   Username: testuser
   Password: TestPass123
   Confirm Password: TestPass123
   [x] Accept terms
   ```
3. Click "Create Account"
4. Expected: Success message → Redirect to login
5. Verify in Moodle: User "testuser" exists

**If fails:** Check AUTHENTICATION.md → Troubleshooting → "Registration fails"

---

### 4. Test Login

1. Navigate to: http://localhost:3000/auth/login
2. Enter:
   ```
   Username: testuser
   Password: TestPass123
   ```
3. Click "Sign In"
4. Expected: Redirect to dashboard
5. Verify: Navbar shows user avatar "TU"

**If fails:** Check AUTHENTICATION.md → Troubleshooting → "Invalid token error"

---

### 5. Test Dashboard

1. Should be at: http://localhost:3000/dashboard
2. Verify displays:
   - [x] Welcome message with name
   - [x] Stats cards
   - [x] "My Courses" section
3. If no courses: "No courses yet" message
4. Click "Browse All Courses" → Should go to /courses

---

### 6. Test My Courses Page

1. Click "My Courses" in navbar dropdown
2. Should show: http://localhost:3000/my-courses
3. Verify:
   - [x] Filter tabs (All, Active, Completed)
   - [x] Course list (if enrolled in any)
   - [x] "No courses" message (if none)

---

### 7. Test Profile Page

1. Click "Profile" in navbar dropdown
2. Should show: http://localhost:3000/profile
3. Verify:
   - [x] User avatar with initials
   - [x] Full name displayed
   - [x] Email, username shown
   - [x] "Edit Profile" button
4. Click "Edit Profile"
5. Change "First Name" to "Testing"
6. Click "Save Changes"
7. Expected: "Profile updated successfully" message

---

### 8. Test Protected Routes

#### Test A: Access while logged in
1. Visit: http://localhost:3000/dashboard
2. Expected: ✅ Shows dashboard

#### Test B: Log out and try access
1. Click user avatar → "Sign Out"
2. Expected: Redirect to home or login
3. Manually visit: http://localhost:3000/dashboard
4. Expected: ✅ Redirect to /auth/login

#### Test C: Log in and auto-redirect
1. At login page from Test B
2. Enter credentials
3. Expected: ✅ Redirect back to /dashboard

---

### 9. Test Session Persistence

1. Log in
2. Close all browser tabs
3. Open new tab
4. Visit: http://localhost:3000
5. Expected: ✅ Still logged in (see avatar in navbar)

---

### 10. Test Navbar Auth UI

#### When Logged Out:
- [x] Shows "Login" button
- [x] Shows "Sign Up" button
- [x] No user avatar

#### When Logged In:
- [x] Shows user avatar (orange circle with initials)
- [x] Avatar has dropdown menu
- [x] Dropdown shows: Dashboard, My Courses, Profile, Sign Out
- [x] Click "Sign Out" logs out

---

### 11. Test Mobile Responsiveness

1. Open browser dev tools (F12)
2. Toggle device toolbar (mobile view)
3. Test:
   - [x] Login page on mobile
   - [x] Register page on mobile
   - [x] Dashboard on mobile
   - [x] Navbar hamburger menu
   - [x] Mobile dropdown menu

---

## 🐛 Common Issues & Fixes

### Issue: "Invalid credentials" on login
**Fix:** Verify user exists in Moodle, try resetting password

### Issue: Registration shows "exception"
**Fix:** Enable `core_user_create_users` in Moodle web services

### Issue: Dashboard shows no courses
**Normal:** User hasn't enrolled yet. Test by enrolling in Moodle first.

### Issue: Protected routes not redirecting
**Fix:** Restart dev server, clear cookies, try again

### Issue: Session lost on page refresh
**Fix:** Check `NEXTAUTH_SECRET` is set, verify `NEXTAUTH_URL` matches

---

## 📊 Expected Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| Register new user | Success → Redirect to login | ⏳ |
| Login with credentials | Success → Redirect to dashboard | ⏳ |
| Access dashboard | Shows welcome + stats + courses | ⏳ |
| Access my-courses | Shows filter tabs + course list | ⏳ |
| Access profile | Shows user data + edit form | ⏳ |
| Edit profile | Success message + updated data | ⏳ |
| Protected route (logged out) | Redirects to login | ⏳ |
| Protected route (logged in) | Shows protected content | ⏳ |
| Session persistence | Stays logged in after browser close | ⏳ |
| Logout | Clears session + redirects | ⏳ |

---

## 🎯 Production Deployment Checklist

Before deploying to production:

- [ ] Generate secure `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Verify Moodle is accessible from production server
- [ ] Test CORS settings
- [ ] Enable HTTPS
- [ ] Test all flows in production environment
- [ ] Set up error logging
- [ ] Configure rate limiting
- [ ] Add monitoring for failed login attempts

---

## 📞 Need Help?

1. Check [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed configuration
2. Review [README.md](./README.md) for deployment instructions
3. Verify Moodle web services are properly configured

---

**Start testing now!** Run `npm run dev` and follow the test sequence above. ✨
