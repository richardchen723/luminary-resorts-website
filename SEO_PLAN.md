# High-ROI SEO Plan: Luminary Resorts
**Focus:** Direct bookings via organic search | **Constraint:** 0-2 content pages/month max

---

## Executive Summary

This plan prioritizes **technical SEO, on-page optimization, and conversion improvements** over content creation. Target: **3-5x organic traffic growth in 60 days** with minimal content investment.

**Key Strategy:**
- Fix technical foundation (robots, sitemap, structured data, metadata)
- Optimize existing pages (home, location, 4 cabin pages)
- Create 4-6 high-intent experience pages (not blog posts)
- Implement conversion-focused improvements
- Local SEO without content grind

**Expected Outcomes (60 days):**
- 2,000-3,000 monthly organic sessions (from <500 baseline)
- 5-10 keywords ranking in top 10
- 40-50% direct booking rate (from <30%)
- Improved Core Web Vitals scores

---

## 1. Top 10 ROI Actions (Ranked by Impact/Effort)

### #1: Implement Dynamic Metadata + Structured Data
**Why:** Immediate SERP visibility improvement, rich snippets, better CTR  
**Effort:** 4-6 hours  
**Impact:** High (foundation for all other SEO work)

**Actions:**
- Add `generateMetadata()` to all cabin pages (`/stay/[slug]`)
- Implement `LodgingBusiness` schema on homepage
- Implement `Hotel` schema on cabin pages
- Add `BreadcrumbList` to all pages
- Add `FAQPage` schema to FAQ page

**Expected Result:** 20-30% CTR improvement from rich snippets, better indexation

---

### #2: Create robots.ts + sitemap.ts
**Why:** Ensures all pages are crawlable, faster indexation  
**Effort:** 1-2 hours  
**Impact:** High (prevents crawl budget waste, enables discovery)

**Actions:**
- Create `app/robots.ts` (allow all, block `/booking/*` with query params)
- Create `app/sitemap.ts` (dynamic generation for stays + static pages)
- Submit to Google Search Console

**Expected Result:** All pages indexed within 7-14 days, no crawl errors

---

### #3: Optimize Location Page for "Houston Weekend Getaway" Intent
**Why:** Location page is under-optimized, huge search volume for "Houston romantic getaway"  
**Effort:** 3-4 hours  
**Impact:** High (captures high-intent local searches)

**Actions:**
- Enhance title/meta: "Romantic Getaway Near Houston | 1 Hour from IAH | Luminary Resorts"
- Add "Directions from Houston" module with driving time, map embed
- Expand content: 1,200-1,500 words targeting "Houston weekend getaway", "romantic cabins near Houston"
- Add internal links to cabin pages + experience pages
- Add FAQ schema with 5-7 location-specific questions

**Expected Result:** Ranking for "romantic getaway near Houston" within 30-45 days

---

### #4: Create 4-6 High-Intent Experience Pages
**Why:** Captures transactional + informational intent without blog commitment  
**Effort:** 8-12 hours (2 hours per page)  
**Impact:** High (new landing pages for high-value keywords)

**Pages to Create:**
1. `/experiences/romantic-getaway-near-houston` (highest priority)
2. `/experiences/luxury-tiny-house-texas`
3. `/experiences/anniversary-weekend`
4. `/experiences/digital-detox-nature-reset`
5. `/experiences/lake-livingston-weekend` (if Lake Livingston is accurate)
6. `/experiences/private-pool-getaway` (if Dew has private pool - verify)

**Each page should:**
- 800-1,200 words (conversion-focused, not blog-style)
- Unique title/meta/H1
- Internal links to relevant cabins
- Booking CTA above fold
- FAQ schema (3-5 questions)
- Image optimization

**Expected Result:** 5-10 new keywords ranking in top 20 within 45-60 days

---

### #5: Enhance Cabin Pages with Unique Content + Internal Linking
**Why:** Current cabin pages may have duplicate content, missing internal links  
**Effort:** 4-6 hours  
**Impact:** Medium-High (improves rankings for cabin-specific searches)

**Actions:**
- Add unique content blocks to each cabin (differentiate Moss vs Dew vs Sol vs Mist)
- Optimize title tags: "Moss Cabin | Luxury Glass Cabin with Forest Views | Luminary Resorts, TX"
- Add 3-5 contextual internal links per page (to location, experiences, other cabins)
- Enhance image alt text with cabin-specific keywords
- Add "Why Book Direct" module

**Expected Result:** Better rankings for "luxury tiny house Texas", cabin-specific searches

---

### #6: Implement Canonical Strategy + Prevent Booking URL Indexation
**Why:** Booking URLs with query params can create duplicate content issues  
**Effort:** 2-3 hours  
**Impact:** Medium (prevents SEO penalties, protects crawl budget)

**Actions:**
- Add canonical tags to all pages (self-referencing)
- Block `/booking/*` URLs with query params in robots.txt
- Ensure `/booking/[slug]` base URL has canonical to `/stay/[slug]`
- Add `noindex` to booking pages with query params (via middleware or metadata)

**Expected Result:** No duplicate content issues, cleaner index

---

### #7: Create Stays Hub Page (`/stays`)
**Why:** Central hub for all cabins, improves information architecture  
**Effort:** 2-3 hours  
**Impact:** Medium (better internal linking, comparison table for conversion)

**Actions:**
- Create `/app/stays/page.tsx`
- Add cabin comparison table (amenities, features, pricing "from $X")
- Internal links to all 4 cabins
- Optimize for "luxury cabins Texas", "tiny house rentals near Houston"

**Expected Result:** Better internal link equity distribution, conversion lift from comparison

---

### #8: Optimize Core Web Vitals (LCP, CLS, INP)
**Why:** Ranking factor + user experience = conversion lift  
**Effort:** 4-6 hours  
**Impact:** Medium (ranking factor, conversion improvement)

**Actions:**
- Audit current scores (PageSpeed Insights)
- Preload hero images
- Optimize font loading (already using next/font, verify)
- Reduce JavaScript bundle size
- Fix any CLS issues (image dimensions, avoid layout shifts)
- Implement streaming/SSR where appropriate

**Expected Result:** LCP < 2.5s, CLS < 0.1, INP < 200ms

---

### #9: Local SEO Optimization (Google Business Profile + NAP Consistency)
**Why:** Captures "near me" searches, local pack visibility  
**Effort:** 1-2 hours  
**Impact:** Medium (local search visibility)

**Actions:**
- Optimize existing Google Business Profile (ensure categories, hours, photos, description are complete)
- Ensure NAP consistency across site (Name: Luminary Resorts at Hilltop, Address: 50 Snowhill Rd, Coldspring TX 77331, Phone: (404) 590-8346)
- Add LocalBusiness schema to location page (match GBP data exactly)
- Get 5-10 basic citations (Yelp, TripAdvisor, regional directories) with consistent NAP
- Encourage reviews (display on site if available)

**Expected Result:** Appear in local pack for "luxury cabins near Houston", "romantic getaways Coldspring TX"

---

### #10: Conversion Optimization (Above-Fold Messaging + Trust Signals)
**Why:** Higher conversion = more revenue from existing traffic  
**Effort:** 3-4 hours  
**Impact:** Medium (revenue lift, not traffic lift)

**Actions:**
- A/B test homepage hero message (romance/healing + Houston proximity)
- Add "Why Book Direct" module (price, flexibility, perks)
- Add trust modules: cancellation policy clarity, FAQs, amenities
- Sticky CTA + availability widget UX improvements
- Unit comparison table on `/stays`

**Expected Result:** 10-20% conversion rate improvement

---

## 2. 14-Day Execution Plan (Day-by-Day)

### Days 1-2: Technical Foundation
**Day 1:**
- [ ] Create `app/robots.ts` (2 hours)
- [ ] Create `app/sitemap.ts` (2 hours)
- [ ] Submit sitemap to Google Search Console (15 min)
- [ ] Test robots.txt accessibility (15 min)

**Day 2:**
- [ ] Implement `LodgingBusiness` schema on homepage (1.5 hours)
- [ ] Create reusable `JsonLd` component (1 hour)
- [ ] Add `BreadcrumbList` schema to all pages (1.5 hours)
- [ ] Test schema in Google Rich Results Test (30 min)

### Days 3-4: Metadata Implementation
**Day 3:**
- [ ] Add `generateMetadata()` to `/stay/[slug]/page.tsx` (2 hours)
- [ ] Add metadata to `/location/page.tsx` (1 hour)
- [ ] Add metadata to `/about/page.tsx`, `/contact/page.tsx`, `/faq/page.tsx` (1 hour)
- [ ] Test Open Graph tags (30 min)

**Day 4:**
- [ ] Implement canonical tags (self-referencing) on all pages (2 hours)
- [ ] Block `/booking/*` with query params in robots.txt (30 min)
- [ ] Add `noindex` to booking pages with query params (1 hour)
- [ ] Test canonical implementation (30 min)

### Days 5-7: Location Page Optimization
**Day 5:**
- [ ] Research keywords: "Houston romantic getaway", "weekend getaway near Houston" (1 hour)
- [ ] Write enhanced location page content (1,200-1,500 words) (3 hours)
- [ ] Add "Directions from Houston" module (1 hour)

**Day 6:**
- [ ] Optimize location page title/meta/H1 (1 hour)
- [ ] Add internal links to cabin pages + experiences (1 hour)
- [ ] Add FAQ schema to location page (5-7 questions) (1.5 hours)
- [ ] Add LocalBusiness schema (1 hour)

**Day 7:**
- [ ] Image optimization for location page (alt text, sizing) (1 hour)
- [ ] Test location page in GSC (30 min)
- [ ] Review and refine content (1 hour)

### Days 8-10: Experience Pages (Create 3 Highest Priority)
**Day 8:**
- [ ] Create `/experiences/romantic-getaway-near-houston` page (2.5 hours)
  - Title: "Romantic Getaway Near Houston | Luxury Cabins 1 Hour Away | Luminary Resorts"
  - Content: 1,000 words, conversion-focused
  - Internal links to all cabins, location page
  - FAQ schema (5 questions)
  - Booking CTA above fold

**Day 9:**
- [ ] Create `/experiences/luxury-tiny-house-texas` page (2.5 hours)
  - Title: "Luxury Tiny House Rentals in Texas | Private Pool Cabins | Luminary Resorts"
  - Content: 1,000 words
  - Internal links + FAQ schema
  - Booking CTA

**Day 10:**
- [ ] Create `/experiences/anniversary-weekend` page (2.5 hours)
  - Title: "Anniversary Weekend Getaway | Romantic Cabins Near Houston | Luminary Resorts"
  - Content: 1,000 words
  - Internal links + FAQ schema
  - Booking CTA

### Days 11-12: Cabin Page Optimization
**Day 11:**
- [ ] Add unique content blocks to each cabin page (differentiate) (2 hours)
- [ ] Optimize title tags for all 4 cabins (1 hour)
- [ ] Add 3-5 internal links per cabin page (1.5 hours)

**Day 12:**
- [ ] Enhance image alt text for all cabin images (2 hours)
- [ ] Add "Why Book Direct" module to cabin pages (1.5 hours)
- [ ] Add `Hotel` schema to all cabin pages (1 hour)

### Days 13-14: Stays Hub + Core Web Vitals
**Day 13:**
- [ ] Create `/app/stays/page.tsx` hub page (2 hours)
- [ ] Add cabin comparison table (1 hour)
- [ ] Optimize for "luxury cabins Texas" keywords (1 hour)
- [ ] Add internal links to all cabins (30 min)

**Day 14:**
- [ ] Audit Core Web Vitals (PageSpeed Insights) (1 hour)
- [ ] Fix LCP issues (preload hero images) (1 hour)
- [ ] Fix CLS issues (image dimensions) (1 hour)
- [ ] Test improvements (30 min)

**Total Time:** ~40-45 hours over 14 days

---

## 3. 30-60 Day Plan (Weekly)

### Week 3 (Days 15-21): Complete Experience Pages
- [ ] Create `/experiences/digital-detox-nature-reset` (2 hours)
- [ ] Create `/experiences/lake-livingston-weekend` (2 hours, verify Lake Livingston accuracy)
- [ ] Create `/experiences/private-pool-getaway` (2 hours, verify Dew has private pool)
- [ ] Add internal linking between experience pages (1 hour)
- [ ] Submit new pages to GSC (15 min)

### Week 4 (Days 22-28): Local SEO + Conversion
- [ ] Optimize existing Google Business Profile (verify categories, hours, photos, description) (30 min)
- [ ] Get 5-10 basic citations (Yelp, TripAdvisor, etc.) with consistent NAP (2 hours)
- [ ] Add "Why Book Direct" module to homepage (1 hour)
- [ ] A/B test homepage hero message (setup, 1 hour)
- [ ] Add trust modules (cancellation policy, FAQs) (1.5 hours)

### Week 5 (Days 29-35): Monitoring + Refinement
- [ ] Review GSC data (impressions, clicks, rankings) (1 hour)
- [ ] Fix any crawl errors (30 min)
- [ ] Optimize top-performing pages based on data (2 hours)
- [ ] Add review schema if reviews available (1 hour)
- [ ] Internal linking audit + improvements (1.5 hours)

### Week 6 (Days 36-42): Content Expansion (If Needed)
- [ ] Evaluate which experience pages are ranking
- [ ] Enhance top-performing pages with additional content (2 hours)
- [ ] Create 1 additional experience page if ROI is high (2 hours)
- [ ] Optimize based on search query data from GSC (1 hour)

### Week 7-8 (Days 43-60): Optimization + Scale
- [ ] Weekly GSC review + keyword tracking (1 hour/week)
- [ ] Fix any technical issues discovered (2 hours)
- [ ] Conversion rate optimization based on GA4 data (2 hours)
- [ ] Link building outreach (if time permits, 3-4 hours)
- [ ] Final audit + report (2 hours)

---

## 4. Backlog Table

| Task | Impact | Effort | Owner | Acceptance Criteria |
|------|--------|--------|-------|---------------------|
| Create robots.ts + sitemap.ts | High | Low (2h) | Dev | All pages crawlable, sitemap submitted to GSC, no crawl errors |
| Implement LodgingBusiness schema | High | Medium (2h) | Dev | Schema validated in Google Rich Results Test, appears in SERP |
| Add dynamic metadata to cabin pages | High | Low (2h) | Dev | Unique title/description per cabin, OG tags working, tested in SERP preview |
| Optimize location page content | High | Medium (4h) | Content/Dev | 1,200+ words, "Houston romantic getaway" keywords, internal links, FAQ schema |
| Create experience pages (4-6 pages) | High | High (12h) | Content/Dev | Each page: 800-1,200 words, unique title/meta, FAQ schema, internal links, booking CTA |
| Implement canonical strategy | Medium | Low (2h) | Dev | All pages have self-referencing canonical, booking URLs blocked/noindexed |
| Enhance cabin pages (unique content) | Medium | Medium (4h) | Content/Dev | Each cabin has unique content blocks, optimized titles, 3-5 internal links |
| Create /stays hub page | Medium | Low (2h) | Dev | Hub page live, comparison table, internal links to all cabins |
| Optimize Core Web Vitals | Medium | Medium (4h) | Dev | LCP < 2.5s, CLS < 0.1, INP < 200ms (PageSpeed Insights) |
| Optimize Google Business Profile | Medium | Low (30m) | Marketing | GBP optimized (categories, hours, photos, description complete), NAP matches site |
| Local citations (5-10 directories) | Medium | Low (2h) | Marketing | Listed on Yelp, TripAdvisor, regional directories, NAP consistent |
| Add BreadcrumbList schema | Medium | Low (1h) | Dev | Breadcrumbs visible on all pages, schema validated |
| Add FAQPage schema | Low | Low (1h) | Dev | FAQ schema on location + 1-2 experience pages, validated |
| Image alt text optimization | Medium | Low (2h) | Content | All images have descriptive alt text with keywords |
| Internal linking audit + improvements | High | Medium (3h) | Content/Dev | 3-5 contextual internal links per page, hub/spoke model |
| Conversion optimization (trust modules) | Medium | Medium (3h) | Dev/Design | "Why Book Direct" module, trust signals, sticky CTA |
| Review schema implementation | Low | Low (1h) | Dev | Review schema on cabin pages (if reviews available), validated |

---

## 5. Next.js Implementation Appendix

### 5.1 URL Map

**Current Structure (Keep):**
- `/` - Homepage
- `/stay/[slug]` - Cabin pages (moss, dew, sol, mist)
- `/location` - Location page
- `/about` - About page
- `/contact` - Contact page
- `/faq` - FAQ page
- `/gallery` - Gallery page
- `/booking/[slug]` - Booking page (with query params)

**New Structure (Add):**
- `/stays` - Stays hub (new)
- `/experiences/romantic-getaway-near-houston` - Experience page
- `/experiences/luxury-tiny-house-texas` - Experience page
- `/experiences/anniversary-weekend` - Experience page
- `/experiences/digital-detox-nature-reset` - Experience page
- `/experiences/lake-livingston-weekend` - Experience page (verify accuracy)
- `/experiences/private-pool-getaway` - Experience page (verify Dew has pool)

**Booking URL Strategy:**
- Keep `/booking/[slug]?checkIn=...&checkOut=...` format
- Add `noindex` to booking pages with query params
- Add canonical from `/booking/[slug]` to `/stay/[slug]` (base URL only)
- Block `/booking/*` with query params in robots.txt

---

### 5.2 Copy-Ready Titles, Metas, H1s

#### Homepage
**Title:** `Luminary Resorts at Hilltop | Luxury Tiny House Retreat Near Houston, Texas`
**Meta:** `Romantic getaway 1 hour from Houston. Four intimate luxury cabins with private pools, floor-to-ceiling windows, and complete seclusion. Perfect for couples seeking romance and healing. Book direct.`
**H1:** `Where Silence Reflects Love`

#### Location Page (`/location`)
**Title:** `Romantic Getaway Near Houston | 1 Hour from IAH | Luminary Resorts, Coldspring TX`
**Meta:** `Luxury tiny house retreat in Coldspring, Texas—just 1 hour from Houston. Private hilltop cabins with panoramic views, perfect for romantic weekends and healing getaways. Book your escape.`
**H1:** `Your Romantic Escape, Just 1 Hour from Houston`

#### Stays Hub (`/stays`)
**Title:** `Luxury Tiny House Rentals in Texas | Private Pool Cabins Near Houston | Luminary Resorts`
**Meta:** `Four luxury tiny house cabins in Coldspring, Texas. Each with unique features: private pools, forest views, lake access. Perfect for couples. Compare cabins and book your romantic getaway.`
**H1:** `Four Intimate Cabins, Each Designed for Connection`

#### Cabin Pages

**Moss (`/stay/moss`):**
**Title:** `Moss Cabin | Luxury Glass Cabin with Forest Views | Luminary Resorts, TX`
**Meta:** `Contemporary glass sanctuary with floor-to-ceiling windows framing the forest. Perfect for couples seeking romance and connection with nature. Book Moss cabin near Houston.`
**H1:** `Moss: A Glass Sanctuary in the Forest`

**Dew (`/stay/dew`):**
**Title:** `Dew Cabin | Luxury Tiny House with Private Pool | Luminary Resorts, TX`
**Meta:** `Asian Zen-inspired cabin with private pool, wall-to-wall windows, and skylight over the bed. Perfect for romantic getaways and digital detox. Book Dew cabin near Houston.`
**H1:** `Dew: An Asian Zen Mirror Cabin with Private Pool`

**Sol (`/stay/sol`):**
**Title:** `Sol Cabin | Hilltop Cabin with Panoramic Sunset Views | Luminary Resorts, TX`
**Meta:** `Perched at the highest point with panoramic views and spectacular sunsets. Luxury cabin with freestanding soaking tub and stargazing deck. Book Sol cabin near Houston.`
**H1:** `Sol: Panoramic Views from the Hilltop`

**Mist (`/stay/mist`):**
**Title:** `Mist Cabin | Lakefront Luxury Cabin with Private Dock | Luminary Resorts, TX`
**Meta:** `Wake to morning mist on the water with direct lake access. Serene lakefront cabin perfect for couples seeking tranquility. Book Mist cabin near Houston.`
**H1:** `Mist: Lakefront Serenity`

#### Experience Pages

**Romantic Getaway Near Houston (`/experiences/romantic-getaway-near-houston`):**
**Title:** `Romantic Getaway Near Houston | Luxury Cabins 1 Hour Away | Luminary Resorts`
**Meta:** `Ultimate romantic getaway 1 hour from Houston. Private pools, floor-to-ceiling windows, complete seclusion. Perfect for anniversaries, proposals, and reconnection. Book now.`
**H1:** `Romantic Getaway for Couples Near Houston`

**Luxury Tiny House Texas (`/experiences/luxury-tiny-house-texas`):**
**Title:** `Luxury Tiny House Rentals in Texas | Private Pool Cabins | Luminary Resorts`
**Meta:** `Experience luxury tiny house living in Texas. Four intimate cabins with private pools, premium amenities, and stunning views. Perfect for couples seeking romance and healing.`
**H1:** `Luxury Tiny House Rentals in Texas`

**Anniversary Weekend (`/experiences/anniversary-weekend`):**
**Title:** `Anniversary Weekend Getaway | Romantic Cabins Near Houston | Luminary Resorts`
**Meta:** `Celebrate your anniversary at a luxury cabin retreat near Houston. Private pools, romantic settings, and complete privacy. Make your special day unforgettable. Book now.`
**H1:** `Anniversary Weekend Getaway for Couples`

**Digital Detox Nature Reset (`/experiences/digital-detox-nature-reset`):**
**Title:** `Digital Detox Retreat | Unplug in Nature Near Houston | Luminary Resorts`
**Meta:** `Disconnect and reconnect in nature. Luxury cabins designed for digital detox, mindfulness, and healing. Perfect for couples seeking stillness and presence. Book your reset.`
**H1:** `Digital Detox: Unplug and Reconnect`

**Lake Livingston Weekend (`/experiences/lake-livingston-weekend`):**
**Title:** `Lake Livingston Weekend Getaway | Luxury Cabins Near the Lake | Luminary Resorts`
**Meta:** `Weekend getaway near Lake Livingston. Luxury tiny house cabins with lake access, private pools, and complete seclusion. Perfect for couples. Book your Lake Livingston escape.`
**H1:** `Lake Livingston Weekend Getaway`

**Private Pool Getaway (`/experiences/private-pool-getaway`):**
**Title:** `Private Pool Getaway | Luxury Cabins with Private Pools | Luminary Resorts`
**Meta:** `Luxury cabins with private pools near Houston. Complete privacy, stunning views, and romantic settings. Perfect for couples seeking an intimate escape. Book now.`
**H1:** `Private Pool Getaway for Couples`

---

### 5.3 Page Outline Sections (Experience Pages)

Each experience page should follow this structure:

1. **Hero Section**
   - H1 (from copy-ready section above)
   - Subheadline (1-2 sentences, benefit-focused)
   - Booking CTA (above fold)

2. **Introduction** (150-200 words)
   - Hook: Address the pain point/desire
   - Solution: How Luminary Resorts solves it
   - Location: "Just 1 hour from Houston"

3. **Why This Experience** (200-300 words)
   - 3-4 key benefits specific to the experience
   - Unique features (private pools, floor-to-ceiling windows, etc.)
   - Emotional appeal (romance, healing, connection)

4. **Perfect For** (100-150 words)
   - Bullet list: anniversaries, proposals, reconnection, healing, etc.
   - Who this experience is ideal for

5. **Our Cabins** (200-250 words)
   - Brief overview of all 4 cabins
   - Internal links to each cabin page
   - Highlight which cabins are best for this experience

6. **What's Included** (100-150 words)
   - Amenities, features, what guests get
   - Trust signals (self check-in, 24/7 support, etc.)

7. **Location & Getting Here** (100-150 words)
   - "1 hour from Houston"
   - Link to location page
   - Brief directions

8. **FAQ Section** (5-7 questions)
   - Experience-specific questions
   - Booking, policies, what to expect
   - Implement FAQPage schema

9. **Booking CTA** (sticky or prominent)
   - "Book Your [Experience] Now"
   - Link to booking widget or cabin pages

**Total Word Count:** 800-1,200 words per page

---

### 5.4 Technical Implementation: Code Snippets

#### 5.4.1 robots.ts

**File:** `app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://luminaryresorts.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/booking/*', // Block booking pages with query params
          '/api/',
          '/tools/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

---

#### 5.4.2 sitemap.ts

**File:** `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'
import { cabins } from '@/lib/cabins'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://luminaryresorts.com'
  const currentDate = new Date()
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/location`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stays`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]
  
  // Cabin pages
  const cabinPages = cabins.map((cabin) => ({
    url: `${baseUrl}/stay/${cabin.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  
  // Experience pages
  const experiencePages = [
    'romantic-getaway-near-houston',
    'luxury-tiny-house-texas',
    'anniversary-weekend',
    'digital-detox-nature-reset',
    'lake-livingston-weekend',
    'private-pool-getaway',
  ].map((slug) => ({
    url: `${baseUrl}/experiences/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  
  return [...staticPages, ...cabinPages, ...experiencePages]
}
```

---

#### 5.4.3 SEO Helper (lib/seo.ts)

**File:** `lib/seo.ts`

```typescript
import type { Metadata } from 'next'

const baseUrl = 'https://luminaryresorts.com'
const siteName = 'Luminary Resorts at Hilltop'

export interface SEOConfig {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
  canonical?: string
}

export function generateMetadata(config: SEOConfig): Metadata {
  const { title, description, path, image, noindex, canonical } = config
  
  const url = `${baseUrl}${path}`
  const ogImage = image || `${baseUrl}/og-image.jpg`
  
  return {
    title,
    description,
    ...(noindex && { robots: { index: false, follow: true } }),
    alternates: {
      canonical: canonical || url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export function getCabinSEO(cabin: { name: string; slug: string; description: string; images?: string[] }) {
  const features: Record<string, string> = {
    moss: 'Forest Views',
    dew: 'Private Pool',
    sol: 'Panoramic Views',
    mist: 'Lakefront Access',
  }
  
  const feature = features[cabin.slug] || 'Luxury Amenities'
  const title = `${cabin.name} Cabin | Luxury Tiny House with ${feature} | Luminary Resorts, TX`
  const description = `${cabin.description.substring(0, 120)}... Perfect for couples seeking romance and tranquility. Book ${cabin.name} cabin near Houston.`
  
  return {
    title,
    description,
    image: cabin.images?.[0] || `${baseUrl}/og-image.jpg`,
  }
}
```

---

#### 5.4.4 JsonLd Component

**File:** `components/json-ld.tsx`

```typescript
interface JsonLdProps {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

---

#### 5.4.5 Breadcrumb Component

**File:** `components/breadcrumbs.tsx`

```typescript
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { JsonLd } from './json-ld'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://luminaryresorts.com${item.href}`,
    })),
  }
  
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          <Home className="w-4 h-4" />
        </Link>
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4" />
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
```

---

#### 5.4.6 Example: generateMetadata() for Cabin Pages

**File:** `app/stay/[slug]/page.tsx` (add this function)

```typescript
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getCabinBySlug } from '@/lib/cabins'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cabin = await getCabinBySlug(slug)
  
  if (!cabin) {
    return {
      title: 'Cabin Not Found | Luminary Resorts',
    }
  }
  
  const seo = getCabinSEO(cabin)
  
  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    path: `/stay/${slug}`,
    image: seo.image,
  })
}
```

---

#### 5.4.7 LodgingBusiness Schema (Homepage)

**File:** `app/page.tsx` (add to component)

```typescript
import { JsonLd } from '@/components/json-ld'

export default async function HomePage() {
  const lodgingSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Luminary Resorts at Hilltop',
    description: 'Luxury tiny house retreat for couples in Coldspring, Texas. Four intimate cabins with private pools, floor-to-ceiling windows, and complete seclusion.',
    url: 'https://luminaryresorts.com',
    logo: 'https://luminaryresorts.com/icon.png',
    image: 'https://luminaryresorts.com/og-image.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '50 Snowhill Rd',
      addressLocality: 'Coldspring',
      addressRegion: 'TX',
      postalCode: '77331',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '30.5885',
      longitude: '-95.1294',
    },
    telephone: '+14045908346',
    priceRange: '$$$',
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Private Pool',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'EV Charging',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Lake Access',
        value: true,
      },
    ],
  }
  
  return (
    <div className="min-h-screen">
      <JsonLd data={lodgingSchema} />
      {/* ... rest of component */}
    </div>
  )
}
```

---

#### 5.4.8 Hotel Schema (Cabin Pages)

**File:** `app/stay/[slug]/page.tsx` (add to component)

```typescript
import { JsonLd } from '@/components/json-ld'

export default async function CabinDetailPage({ params }: PageProps) {
  const { slug } = await params
  const cabin = await getCabinBySlug(slug)
  
  if (!cabin) {
    notFound()
  }
  
  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: `${cabin.name} Cabin - Luminary Resorts`,
    description: cabin.description,
    image: cabin.images || [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '50 Snowhill Rd',
      addressLocality: 'Coldspring',
      addressRegion: 'TX',
      postalCode: '77331',
      addressCountry: 'US',
    },
    containedIn: {
      '@type': 'LodgingBusiness',
      name: 'Luminary Resorts at Hilltop',
    },
    amenityFeature: cabin.amenities?.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })) || [],
    numberOfRooms: {
      '@type': 'QuantitativeValue',
      value: 1,
    },
    occupancy: {
      '@type': 'QuantitativeValue',
      value: 2,
    },
  }
  
  return (
    <div className="min-h-screen">
      <JsonLd data={hotelSchema} />
      {/* ... rest of component */}
    </div>
  )
}
```

---

#### 5.4.9 FAQPage Schema (Location Page)

**File:** `app/location/page.tsx` (add to component)

```typescript
import { JsonLd } from '@/components/json-ld'

export default function LocationPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How far is Luminary Resorts from Houston?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Luminary Resorts is located approximately 1 hour (60 miles) from Houston, Texas. We are easily accessible from both George Bush Intercontinental Airport (IAH) and William P. Hobby Airport (HOU).',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the address of Luminary Resorts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Luminary Resorts at Hilltop is located at 50 Snowhill Rd, Coldspring, TX 77331.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there parking available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, free private parking is available at each cabin. We can accommodate 2-3 cars per cabin, and trailer/boat parking is available along Snowhill Rd.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is there to do near Luminary Resorts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nearby attractions include Lake Livingston (5 minutes away), Sam Houston National Forest (20 minutes), and Wolf Creek Park (10 minutes). You can also enjoy boating, fishing, hiking, and wine tasting in the area.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer EV charging?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we have Level 2 EV chargers (Tesla chargers with J1772 adapters) available in the parking area.',
        },
      },
    ],
  }
  
  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema} />
      {/* ... rest of component */}
    </div>
  )
}
```

---

#### 5.4.10 Booking URL Canonical Strategy

**File:** `app/booking/[slug]/page.tsx` (add metadata)

```typescript
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { useSearchParams } from 'next/navigation'

// For client components, use a wrapper or middleware approach
// Option 1: Add noindex via metadata in a server component wrapper
// Option 2: Use middleware to add noindex header

// In middleware.ts (create if doesn't exist):
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // If booking page has query params, add noindex header
  if (pathname.startsWith('/booking/') && searchParams.toString()) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, follow')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/booking/:path*',
}
```

**Alternative:** Add canonical in booking page component:

```typescript
// In app/booking/[slug]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const hasQueryParams = true // Check if query params exist (this is simplified)
  
  return {
    ...(hasQueryParams && { robots: { index: false, follow: true } }),
    alternates: {
      canonical: `https://luminaryresorts.com/stay/${slug}`, // Canonical to cabin page
    },
  }
}
```

---

### 5.5 Measurement Plan

#### GA4 Events to Track

**File:** Create `lib/analytics.ts` or add to existing tracking

```typescript
// Track SEO-relevant events
export function trackSEOEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Usage examples:
trackSEOEvent('view_stay', { cabin_slug: 'moss', page_path: '/stay/moss' })
trackSEOEvent('select_dates', { cabin_slug: 'dew', check_in: '2025-03-15' })
trackSEOEvent('view_pricing', { cabin_slug: 'sol', nights: 2 })
trackSEOEvent('start_checkout', { cabin_slug: 'mist', total: 450 })
trackSEOEvent('reservation_confirmed', { cabin_slug: 'dew', booking_id: 'xxx' })
```

**Events to Implement:**
1. `view_stay` - When user views a cabin page
2. `select_dates` - When user selects check-in/check-out dates
3. `view_pricing` - When pricing is displayed/calculated
4. `start_checkout` - When user clicks "Book Now"
5. `reservation_confirmed` - When booking is completed

---

#### Google Search Console Setup

1. **Verify Site Ownership**
   - Add property: `luminaryresorts.com`
   - Verify via DNS, HTML file, or Google Analytics

2. **Submit Sitemap**
   - URL: `https://luminaryresorts.com/sitemap.xml`
   - Submit in GSC → Sitemaps

3. **Monitor Key Metrics (Weekly)**
   - Impressions (total, branded vs non-branded)
   - Clicks
   - Average position
   - CTR (click-through rate)
   - Top queries (top 20)
   - Top pages (top 10)

4. **Track Keyword Rankings**
   - Target keywords:
     - "luxury tiny house Texas"
     - "romantic getaway near Houston"
     - "luxury cabins near Houston"
     - "tiny house rentals Texas"
     - "romantic cabins Texas"
     - "Lake Livingston weekend getaway"
     - "Coldspring Texas cabins"
     - "Houston weekend getaway"
     - "anniversary weekend near Houston"
     - "private pool cabin Texas"

---

#### Success Metrics (30/60 Days)

**30-Day Targets:**
- All pages indexed in GSC
- 0 crawl errors
- 5-10 keywords ranking in top 50
- 1,000-1,500 monthly organic sessions
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms

**60-Day Targets:**
- 2,000-3,000 monthly organic sessions
- 5-10 keywords ranking in top 10
- 20-30% CTR improvement (from rich snippets)
- 40-50% direct booking rate
- 3-5 experience pages ranking in top 20

---

## 6. Internal Linking Strategy

### Hub-and-Spoke Model

**Homepage (Hub)**
- Links to: `/location`, `/stays`, `/stay/moss`, `/stay/dew`, `/stay/sol`, `/stay/mist`
- Links to: Top 2-3 experience pages

**Location Page (Hub)**
- Links to: All 4 cabin pages
- Links to: All experience pages
- Links to: `/stays`, `/about`, `/faq`

**Stays Hub (`/stays`)**
- Links to: All 4 cabin pages (primary)
- Links to: `/location`
- Links to: 2-3 experience pages

**Cabin Pages (Spokes)**
- Each cabin page links to:
  - Other 3 cabin pages (cross-linking)
  - `/location`
  - `/stays`
  - 2-3 relevant experience pages
  - `/about` (trust signal)

**Experience Pages (Spokes)**
- Each experience page links to:
  - All 4 cabin pages (primary)
  - `/location`
  - `/stays`
  - 1-2 related experience pages

**Target:** 3-5 contextual internal links per page

---

## 7. Content Guidelines (Experience Pages)

### Tone & Voice
- **Romantic, healing, intimate** (not corporate)
- **Benefit-focused** (not feature-focused)
- **Emotional appeal** (connection, stillness, presence)
- **Houston proximity** (mention "1 hour from Houston" naturally)

### Keyword Integration
- Use keywords naturally (don't stuff)
- Primary keyword in H1, first paragraph, and 1-2 times in body
- Secondary keywords: "luxury tiny house", "romantic getaway", "near Houston", "couples retreat"
- Location keywords: "Coldspring TX", "Lake Livingston", "Point Blank"

### Conversion Focus
- **Above-fold CTA** (booking widget or "Book Now" button)
- **Trust signals** throughout (cancellation policy, 24/7 support, self check-in)
- **Social proof** (if reviews available)
- **Clear value proposition** (why book direct, what makes this special)

---

## 8. Quick Reference: File Checklist

### Files to Create
- [ ] `app/robots.ts`
- [ ] `app/sitemap.ts`
- [ ] `lib/seo.ts`
- [ ] `components/json-ld.tsx`
- [ ] `components/breadcrumbs.tsx`
- [ ] `app/stays/page.tsx`
- [ ] `app/experiences/romantic-getaway-near-houston/page.tsx`
- [ ] `app/experiences/luxury-tiny-house-texas/page.tsx`
- [ ] `app/experiences/anniversary-weekend/page.tsx`
- [ ] `app/experiences/digital-detox-nature-reset/page.tsx`
- [ ] `app/experiences/lake-livingston-weekend/page.tsx` (verify accuracy)
- [ ] `app/experiences/private-pool-getaway/page.tsx` (verify Dew has pool)

### Files to Modify
- [ ] `app/stay/[slug]/page.tsx` (add generateMetadata, Hotel schema, unique content)
- [ ] `app/location/page.tsx` (enhance content, add FAQ schema, LocalBusiness schema)
- [ ] `app/page.tsx` (add LodgingBusiness schema)
- [ ] `app/faq/page.tsx` (add FAQPage schema)
- [ ] `app/booking/[slug]/page.tsx` (add noindex for query params, canonical)
- [ ] `app/about/page.tsx` (add metadata)
- [ ] `app/contact/page.tsx` (add metadata)

---

## 9. Notes & Considerations

### Booking URL Strategy
- **Recommendation:** Keep `/booking/[slug]?checkIn=...&checkOut=...` format
- **Rationale:** Clean URLs, easy to track, Hostaway integration already uses this
- **SEO Safety:** Block query params in robots.txt, add noindex via middleware

### Schema Choice: Hotel vs VacationRental
- **Recommendation:** Use `Hotel` schema (more comprehensive, better for Google)
- **Rationale:** Hotels schema supports amenities, pricing, reviews better than VacationRental
- **Alternative:** If Google doesn't accept Hotel, use `LodgingBusiness` with `accommodationCategory`

### Experience Pages vs Blog
- **Key Difference:** Experience pages are conversion-focused landing pages, not informational blog posts
- **Structure:** Hero → Benefits → Cabins → FAQ → CTA (not: intro → body → conclusion)
- **Goal:** Drive bookings, not just traffic

### Local SEO Without Content Grind
- **Focus:** Optimize existing Google Business Profile, NAP consistency, basic citations
- **Skip:** Extensive local directory submissions, local blog content
- **Priority:** Ensure GBP is fully optimized (categories, hours, photos, description), NAP matches everywhere
- **Note:** Google Business Profile is already set up at https://maps.app.goo.gl/p4cNkeYG1XzHoC6s9 - focus on optimization

---

## 10. Next Steps

1. **Review this plan** with team
2. **Prioritize** based on resources (start with #1-3 from Top 10 ROI Actions)
3. **Set up tracking** (GA4 events, GSC)
4. **Begin Day 1 tasks** (robots.ts, sitemap.ts)
5. **Schedule content creation** for experience pages (if outsourcing)

**Estimated Total Time:** 40-50 hours over 14 days (intensive) or 60-70 hours over 30 days (sustainable pace)

---

**Last Updated:** [Date]  
**Version:** 1.0  
**Status:** Ready for Implementation
