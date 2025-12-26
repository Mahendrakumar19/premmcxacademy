# Prem MCMX LMS

A stunning, modern Learning Management System with **complete authentication** and **Moodle integration**.

![LiquidGlass LMS](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Moodle](https://img.shields.io/badge/Moodle-REST%20API-orange?style=for-the-badge&logo=moodle)
![Auth](https://img.shields.io/badge/NextAuth.js-5-green?style=for-the-badge)

## 🎉 NEW: Complete Authentication System

Your LMS now includes a **production-ready authentication system** with:

- ✅ User registration (creates accounts in Moodle)
- ✅ Secure login with session management
- ✅ Protected routes (Dashboard, Profile, My Courses)
- ✅ User profile management
- ✅ JWT-based sessions (30-day expiry)
- ✅ Responsive design with dark mode

### 📚 Complete Documentation

- **[🚀 AUTH_QUICKSTART.md](AUTH_QUICKSTART.md)** - Test authentication in 5 minutes
- **[📋 SUMMARY.md](SUMMARY.md)** - Complete overview of what's been built
- **[🔐 AUTHENTICATION.md](AUTHENTICATION.md)** - Detailed configuration guide
- **[🧪 TESTING.md](TESTING.md)** - Comprehensive testing checklist
- **[🏗️ ARCHITECTURE.md](ARCHITECTURE.md)** - System design and architecture
- **[📖 DOCS_INDEX.md](DOCS_INDEX.md)** - Documentation navigation guide

👉 **Start here:** [AUTH_QUICKSTART.md](AUTH_QUICKSTART.md) to test the authentication system!

---

## ✨ Features

### Authentication & User Management
- 🔐 **Complete Auth System** - Registration, login, logout with NextAuth.js
- 👤 **User Profiles** - View and edit profile information
- 🛡️ **Protected Routes** - Middleware-based route protection
- 🔑 **Session Management** - Secure JWT sessions with 30-day expiry
- 📱 **Responsive Auth UI** - Mobile-friendly login and registration

### LMS Features
- 🎨 **Modern UI** - Clean design without glass effects
- 🔗 **Moodle Integration** - Full REST API integration
- 📚 **Course Management** - Browse courses, view content, track progress
- 👥 **User Dashboard** - Personalized dashboard with enrolled courses
- 📊 **My Courses** - Track and manage your enrolled courses
- 🎯 **Course Details** - Access course materials and activities
- 🌙 **Dark/Light Mode** - Seamless theme toggle with persistence
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast & Modern** - Built with Next.js 16 and React 19

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- A Moodle instance with Web Services enabled
- A Moodle Web Service token

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```env
   # Moodle Configuration
   MOODLE_URL=https://your-moodle-site.com
   MOODLE_TOKEN=your_webservice_token_here
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=http://localhost:3000
   
   # Public Variables
   NEXT_PUBLIC_MOODLE_URL=https://your-moodle-site.com
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Getting a Moodle Token

1. Log in to your Moodle site as an administrator
2. Navigate to: **Site administration** → **Server** → **Web services** → **Manage tokens**
3. Create a token for your user account
4. Enable required web service functions:
   - `core_webservice_get_site_info`
   - `core_course_get_courses`
   - `core_enrol_get_users_courses`
   - `core_course_get_contents`
   - `core_enrol_get_enrolled_users`
   - `gradereport_user_get_grade_items`
   - `core_course_search_courses`
5. Copy the token and paste it into your `.env.local` file

## 📁 Project Structure

```
lms-liquid-glass/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/
│   │   │   └── moodle/        # Moodle REST API proxy
│   │   ├── courses/           # Course listing and detail pages
│   │   ├── settings/          # Settings page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard (home)
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── Navbar.tsx
│   │   └── CourseCard.tsx
│   ├── lib/                   # Utility functions
│   │   └── moodle.ts          # Moodle API helpers
│   └── types/                 # TypeScript type definitions
│       └── moodle.ts          # Moodle API types
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: React 19
- **Backend Integration**: Moodle REST API
- **Deployment**: Vercel-ready

## 📚 API Endpoints

The app includes a unified API proxy at `/api/moodle`:

| Action | Query Parameters | Description |
|--------|-----------------|-------------|
| `siteinfo` | - | Get Moodle site information |
| `courses` | `userid` (optional) | Get all courses or user courses |
| `course-contents` | `courseid` (required) | Get course sections and modules |
| `enrolled-users` | `courseid` (required) | Get enrolled users in a course |
| `grades` | `courseid`, `userid` | Get user grades for a course |
| `search-courses` | `criterianame`, `criteriavalue` | Search courses |

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css` to customize the Liquid Glass theme.

### Adding More Moodle Functions

1. Add TypeScript types in `src/types/moodle.ts`
2. Add helper functions in `src/lib/moodle.ts`
3. Add API endpoints in `src/app/api/moodle/route.ts`

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables: `MOODLE_URL` and `MOODLE_TOKEN`
4. Deploy!

## 🔒 Security Notes

- Never commit `.env.local` or real tokens to version control
- Use environment variables for all sensitive data
- Use HTTPS in production
- Regularly rotate your Moodle tokens

## 📄 License

MIT License - feel free to use this project for your own LMS!
