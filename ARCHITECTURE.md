# Authentication System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │   Navbar   │  │   Login    │  │  Register  │  │  Dashboard   │ │
│  │ (Auth UI)  │  │    Page    │  │    Page    │  │    Page      │ │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬───────┘ │
│         │                │                │                │          │
│         │     ┌──────────┴────────────────┴────────────┐  │         │
│         │     │      SessionProvider (Client)          │  │         │
│         │     │      useSession() Hook                 │  │         │
│         └─────┤      Manages Auth State                ├──┘         │
│               └────────────────┬───────────────────────┘            │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                                 │ HTTP Requests
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APPLICATION                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Middleware.ts                            │    │
│  │  Protects routes: /dashboard, /profile, /my-courses        │    │
│  │  Checks session → Allows/Denies → Redirects to login       │    │
│  └────────────────────┬───────────────────────────────────────┘    │
│                       │                                              │
│                       ▼                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 API Routes                                   │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────┐       │   │
│  │  │  /api/auth/[...nextauth]/route.ts               │       │   │
│  │  │  • GET handler (session checks)                  │       │   │
│  │  │  • POST handler (login/logout)                   │       │   │
│  │  └──────────────┬───────────────────────────────────┘       │   │
│  │                 │                                             │   │
│  │                 ▼                                             │   │
│  │  ┌──────────────────────────────────────────────────┐       │   │
│  │  │  lib/auth.ts (NextAuth Configuration)            │       │   │
│  │  │  • CredentialsProvider                           │       │   │
│  │  │  • authorize() function                          │       │   │
│  │  │  • JWT callbacks                                 │       │   │
│  │  │  • Session strategy                              │       │   │
│  │  └──────────────┬───────────────────────────────────┘       │   │
│  │                 │                                             │   │
│  │  ┌──────────────┴───────────────────────────────────┐       │   │
│  │  │  /api/auth/register/route.ts                     │       │   │
│  │  │  • POST handler for registration                 │       │   │
│  │  │  • Validates input                               │       │   │
│  │  │  • Calls Moodle API                              │       │   │
│  │  └──────────────┬───────────────────────────────────┘       │   │
│  └─────────────────┼───────────────────────────────────────────┘   │
│                    │                                                 │
└────────────────────┼─────────────────────────────────────────────────┘
                     │
                     │ HTTPS Requests
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       MOODLE SERVER                                  │
│                  (srv1215874.hstgr.cloud)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              REST API Endpoints                             │    │
│  │                                                              │    │
│  │  ┌───────────────────────────────────────────────────┐     │    │
│  │  │  /login/token.php                                 │     │    │
│  │  │  Input: username, password                        │     │    │
│  │  │  Output: user token                               │     │    │
│  │  └───────────────────────────────────────────────────┘     │    │
│  │                                                              │    │
│  │  ┌───────────────────────────────────────────────────┐     │    │
│  │  │  /webservice/rest/server.php                      │     │    │
│  │  │  Functions:                                        │     │    │
│  │  │  • core_user_create_users                         │     │    │
│  │  │  • core_webservice_get_site_info                  │     │    │
│  │  │  • core_user_get_users_by_field                   │     │    │
│  │  │  • core_enrol_get_users_courses                   │     │    │
│  │  └───────────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Moodle Database                                │    │
│  │  • User accounts                                            │    │
│  │  • Course enrollments                                       │    │
│  │  • User profiles                                            │    │
│  │  • Course data                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Registration Flow Diagram

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Fills registration form
     ▼
┌──────────────────┐
│  Register Page   │
│  /auth/register  │
└────┬─────────────┘
     │ 2. Submit form (POST)
     ▼
┌──────────────────────────┐
│  /api/auth/register      │
│  • Validate input        │
│  • Check required fields │
└────┬─────────────────────┘
     │ 3. Call Moodle API
     ▼
┌─────────────────────────────────┐
│  Moodle API                     │
│  core_user_create_users         │
│  • Create user account          │
│  • Store in database            │
└────┬────────────────────────────┘
     │ 4. Return userId
     ▼
┌──────────────────────────┐
│  Registration Success    │
│  • Show success message  │
│  • Redirect to login     │
└──────────────────────────┘
```

---

## Login Flow Diagram

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Enter username & password
     ▼
┌──────────────────┐
│   Login Page     │
│  /auth/login     │
└────┬─────────────┘
     │ 2. Submit (signIn)
     ▼
┌─────────────────────────────────┐
│  NextAuth.js                    │
│  /api/auth/[...nextauth]        │
└────┬────────────────────────────┘
     │ 3. Call authorize()
     ▼
┌─────────────────────────────────┐
│  lib/auth.ts                    │
│  CredentialsProvider            │
│  • authorize() function         │
└────┬────────────────────────────┘
     │ 4. Authenticate with Moodle
     ▼
┌─────────────────────────────────┐
│  Moodle API                     │
│  /login/token.php               │
│  • Validate credentials         │
│  • Return token                 │
└────┬────────────────────────────┘
     │ 5. Get user info
     ▼
┌─────────────────────────────────┐
│  Moodle API                     │
│  core_webservice_get_site_info  │
│  • Fetch user details           │
│  • Return user object           │
└────┬────────────────────────────┘
     │ 6. Create JWT session
     ▼
┌─────────────────────────────────┐
│  NextAuth.js JWT                │
│  • Sign token (30 days)         │
│  • Store in HTTP-only cookie    │
└────┬────────────────────────────┘
     │ 7. Redirect to dashboard
     ▼
┌──────────────────┐
│   Dashboard      │
│  /dashboard      │
│  User logged in! │
└──────────────────┘
```

---

## Protected Route Flow

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Visit /dashboard
     ▼
┌─────────────────────────────────┐
│  middleware.ts                  │
│  • Intercept request            │
│  • Check session                │
└────┬────────────────────────────┘
     │
     ├─── Has Session? ───┐
     │                     │
     ▼ YES                 ▼ NO
┌─────────────┐    ┌──────────────────┐
│  Dashboard  │    │  Redirect Login  │
│  (Allow)    │    │  /auth/login     │
└─────────────┘    └─────┬────────────┘
                         │ 2. User logs in
                         ▼
                   ┌──────────────────┐
                   │  After Login     │
                   │  Redirect back   │
                   │  to /dashboard   │
                   └──────────────────┘
```

---

## Session Management

```
┌──────────────────────────────────────────────────────────┐
│                    User Session Lifecycle                 │
└──────────────────────────────────────────────────────────┘

1. Login
   │
   ▼
   JWT Token Created
   • Signed with NEXTAUTH_SECRET
   • Stored in HTTP-only cookie
   • Expires in 30 days
   │
   ▼
2. Every Page Load
   │
   ▼
   SessionProvider checks token
   • Validates signature
   • Checks expiry
   • Provides session data
   │
   ├─── Valid? ───┐
   │               │
   ▼ YES           ▼ NO
   Continue        Redirect to login
   │
   ▼
3. Session Active
   │
   ▼
   useSession() Hook
   • Returns user data
   • status: "authenticated"
   • Navbar shows user menu
   │
   ▼
4. Logout (30 days later or manual)
   │
   ▼
   signOut() called
   • Delete cookie
   • Clear session
   • Redirect to home
```

---

## Data Flow: Dashboard Page

```
┌─────────────────┐
│  User visits    │
│  /dashboard     │
└────┬────────────┘
     │ 1. Middleware checks session
     ▼
┌─────────────────────────────────┐
│  Dashboard Page Component       │
│  • useSession() hook            │
│  • Get session.user.token       │
└────┬────────────────────────────┘
     │ 2. Fetch courses
     ▼
┌─────────────────────────────────┐
│  Client-side API Call           │
│  NEXT_PUBLIC_MOODLE_URL         │
│  /webservice/rest/server.php    │
│  wsfunction=core_enrol_...      │
│  wstoken=session.user.token     │
└────┬────────────────────────────┘
     │ 3. Moodle returns courses
     ▼
┌─────────────────────────────────┐
│  Moodle Database                │
│  • Query user's enrollments     │
│  • Return course list           │
└────┬────────────────────────────┘
     │ 4. Display courses
     ▼
┌─────────────────────────────────┐
│  Dashboard UI                   │
│  • Stats cards                  │
│  • Course grid                  │
│  • "No courses" state           │
└─────────────────────────────────┘
```

---

## File Dependencies

```
app/layout.tsx
├── components/SessionProvider.tsx
    └── next-auth/react (SessionProvider)

components/Navbar.tsx
├── next-auth/react (useSession, signOut)
└── SessionProvider (from layout)

app/auth/login/page.tsx
└── next-auth/react (signIn)

app/api/auth/[...nextauth]/route.ts
└── lib/auth.ts (authOptions)
    ├── bcryptjs (password hashing)
    └── Moodle API calls

app/api/auth/register/route.ts
└── Moodle API (core_user_create_users)

middleware.ts
└── next-auth/middleware (withAuth)
    └── lib/auth.ts

app/dashboard/page.tsx
├── next-auth/react (useSession)
└── Moodle API (core_enrol_get_users_courses)

app/my-courses/page.tsx
├── next-auth/react (useSession)
└── Moodle API (core_enrol_get_users_courses)

app/profile/page.tsx
├── next-auth/react (useSession)
└── Moodle API (core_user_get_users_by_field)
```

---

## Environment Variables Flow

```
┌──────────────┐
│  .env.local  │
└──────┬───────┘
       │
       ├─── Server-side Only ────────────────────┐
       │                                          │
       │  MOODLE_TOKEN                            │
       │  Used in:                                │
       │  • lib/auth.ts (login)                   │
       │  • api/auth/register (user creation)     │
       │                                          │
       │  NEXTAUTH_SECRET                         │
       │  Used in:                                │
       │  • lib/auth.ts (JWT signing)             │
       │  • middleware.ts (JWT validation)        │
       │                                          │
       │  NEXTAUTH_URL                            │
       │  Used in:                                │
       │  • lib/auth.ts (callback URLs)           │
       │  • NextAuth.js (redirects)               │
       │                                          │
       │  MOODLE_URL                              │
       │  Used in:                                │
       │  • lib/auth.ts (API calls)               │
       │  • api/auth/register (API calls)         │
       │                                          │
       └──────────────────────────────────────────┘
       │
       ├─── Client-side Accessible ──────────────┐
       │                                          │
       │  NEXT_PUBLIC_MOODLE_URL                  │
       │  Used in:                                │
       │  • app/dashboard/page.tsx (fetch)        │
       │  • app/my-courses/page.tsx (fetch)       │
       │  • app/profile/page.tsx (fetch)          │
       │                                          │
       └──────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Input Validation                              │
│  • Form validation (client-side)                        │
│  • API route validation (server-side)                   │
│  • Moodle API validation                                │
└───────────────────┬─────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Authentication                                │
│  • Username/password check                              │
│  • Moodle token generation                              │
│  • JWT token creation                                   │
└───────────────────┬─────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Authorization                                 │
│  • Middleware route protection                          │
│  • Session validation                                   │
│  • JWT signature verification                           │
└───────────────────┬─────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Secure Storage                                │
│  • HTTP-only cookies (no JS access)                     │
│  • Signed JWT tokens                                    │
│  • Environment variables (not exposed)                  │
└───────────────────┬─────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Transport Security                            │
│  • HTTPS (production)                                   │
│  • Secure cookie flags                                  │
│  • CORS protection                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### JWT Token Structure
```json
{
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "moodle_user_token_here"
  },
  "exp": 1735689600,  // Expiry (30 days)
  "iat": 1733097600   // Issued at
}
```

### Session Object (useSession)
```typescript
{
  user: {
    id: string,      // Moodle user ID
    name: string,    // Full name
    email: string,   // User email
    token: string    // Moodle token for API calls
  },
  expires: string    // ISO date
}
```

### Protected Route Matcher
```typescript
matcher: [
  '/dashboard/:path*',     // All dashboard routes
  '/profile/:path*',       // All profile routes
  '/my-courses/:path*',    // All my-courses routes
  '/checkout'              // Checkout page only
]
```

---

This architecture provides:
- ✅ Centralized authentication through Moodle
- ✅ Secure session management with JWT
- ✅ Protected routes with middleware
- ✅ Client-side and server-side data fetching
- ✅ Scalable and maintainable structure
