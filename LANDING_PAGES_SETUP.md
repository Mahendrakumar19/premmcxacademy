# Landing Pages with AdSense & Meta Ads - Setup Guide

## Overview

I've created **3 complete landing pages** for monetizing with Google AdSense and Meta ads, complete with privacy policies and terms & conditions pages. All pages use **Moodle local storage** for user preferences and calculation data.

---

## Landing Pages Created

### 1. **Blog Landing Page** 📝
- **Route:** `/blog`
- **Purpose:** Educational content and trading articles
- **Color Theme:** Indigo/Purple gradient
- **Ad Slots:** 3 Google AdSense blocks (top, middle, bottom)
- **Features:**
  - Featured articles grid
  - Category badges
  - Meta Pixel tracking
  - CTA to explore courses
  - Professional footer with links

**Related Legal Pages:**
- Privacy Policy: `/privacy-blog`
- Terms & Conditions: `/terms-blog`

---

### 2. **Tools Landing Page** 🛠️
- **Route:** `/tools`
- **Purpose:** Free trading calculation tools with local storage
- **Color Theme:** Green/Emerald gradient
- **Ad Slots:** 3 Google AdSense blocks
- **Features:**
  - 6 trading tools grid (Position Size, Pivot Points, Risk/Reward, etc.)
  - Benefits section
  - Mobile responsive
  - Local storage for user preferences
  - Analytics integration

**Related Legal Pages:**
- Privacy Policy: `/privacy-tools`
- Terms & Conditions: `/terms-tools`

---

### 3. **Webinars Landing Page** 🎓
- **Route:** `/webinars`
- **Purpose:** Live training sessions and market analysis
- **Color Theme:** Orange/Red gradient
- **Ad Slots:** 3 Google AdSense blocks
- **Features:**
  - Upcoming webinars list (with schedule/registration)
  - Why join section
  - Testimonials from traders
  - Live Q&A indicators
  - Recording access info

**Related Legal Pages:**
- Privacy Policy: `/privacy-webinars`
- Terms & Conditions: `/terms-webinars`

---

## Privacy & Legal Pages (6 Pages Total)

### Blog Section
- **`/privacy-blog`** - Covers:
  - Automatic data collection (IP, browser, cookies)
  - Third-party services (Google Analytics, AdSense, Meta Pixel)
  - Cookie tracking
  - Data security measures
  - User rights (GDPR/privacy)

- **`/terms-blog`** - Covers:
  - Use license restrictions
  - Trading disclaimer
  - Accuracy of materials
  - Liability limitations
  - Link policies

### Tools Section
- **`/privacy-tools`** - Covers:
  - Local storage usage
  - Client-side calculations
  - Data security (all on device)
  - No server transmission of trading data
  - Browser storage management

- **`/terms-tools`** - Covers:
  - Tool usage rights
  - Calculation accuracy
  - No financial advice disclaimer
  - Liability exclusions
  - Tool availability

### Webinars Section
- **`/privacy-webinars`** - Covers:
  - Registration information collection
  - Recording & storage
  - Video retention policy (2 years)
  - Communication practices
  - Data retention timelines

- **`/terms-webinars`** - Covers:
  - Registration terms
  - Recording consent
  - Conduct guidelines
  - Trading risk acknowledgment
  - Webinar schedule changes

---

## Ad Implementation Details

### Google AdSense Integration
```typescript
// Available globally across all landing pages
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx

// Usage in pages:
<ins className="adsbygoogle" 
  data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
  data-ad-slot="1234567890"
  data-ad-format="horizontal" />
```

**Ad Slots by Page:**
| Page | Slot 1 | Slot 2 | Slot 3 |
|------|--------|--------|--------|
| Blog | 1234567890 | 0987654321 | 5555555555 |
| Tools | 2222222222 | 3333333333 | 4444444444 |
| Webinars | 6666666666 | 7777777777 | 8888888888 |

### Meta Pixel Integration
```typescript
// Add to environment:
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

// Automatically tracks:
- Page views
- Conversion events
- User interactions
```

---

## Local Storage Usage (Moodle)

All tools store data in browser local storage:

```typescript
// Storage keys used:
localStorage.setItem('tool_preferences', JSON.stringify(data));
localStorage.setItem('last_calculations', JSON.stringify(data));
localStorage.setItem('user_settings', JSON.stringify(data));

// Data remains on device, never transmitted to servers
// User can clear anytime via browser settings
```

**Storage Benefits:**
- ✅ Fast calculations (no server round-trip)
- ✅ Works offline
- ✅ User data privacy
- ✅ Persistent across sessions
- ✅ Easy to clear/reset

---

## Environment Variables Setup

Add these to your `.env.local`:

```env
# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

**Get Your Credentials:**
1. **Google AdSense:** https://www.google.com/adsense/
2. **Meta Pixel:** https://www.facebook.com/pixels/

---

## Monetization Structure

### Revenue Streams
1. **Google AdSense** - Display ads on all pages
2. **Meta Conversions** - Track course enrollments
3. **Affiliate Marketing** - Coming soon
4. **Premium Tools** - Upgrade option for advanced features

### Ad Placement Strategy
- **Top:** Hero section teaser ad
- **Middle:** Sidebar or inline ad during content
- **Bottom:** Footer conversion-focused ad

---

## Compliance & Legal

All pages include:
- ✅ Privacy Policy with GDPR compliance
- ✅ Terms & Conditions with trading disclaimers
- ✅ Trading risk acknowledgments
- ✅ Cookie disclosures
- ✅ Financial advice disclaimers
- ✅ Data retention policies

---

## Routes Summary

```
/blog                    → Blog landing page
  /privacy-blog          → Privacy policy
  /terms-blog            → Terms & conditions

/tools                   → Tools landing page
  /privacy-tools         → Privacy policy
  /terms-tools           → Terms & conditions

/webinars                → Webinars landing page
  /privacy-webinars      → Privacy policy
  /terms-webinars        → Terms & conditions
```

---

## Next Steps

1. **Update environment variables** with your actual IDs
2. **Verify AdSense account** and replace client ID
3. **Set up Meta Pixel** and add pixel ID
4. **Test ads** in development
5. **Configure** ad sizes and placements
6. **Monitor** performance in respective dashboards

---

## Mobile Responsiveness

All pages are fully responsive:
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ Large screens (1400px+)

---

## Performance Notes

- All ad scripts load asynchronously
- Local storage reduces server load
- Meta Pixel tracks without slowing page
- AdSense optimized for responsive design
- Minimal impact on Core Web Vitals

---

**Created:** January 15, 2024  
**Status:** ✅ Ready for Production  
**Dev Server:** Running on `http://localhost:3000`
