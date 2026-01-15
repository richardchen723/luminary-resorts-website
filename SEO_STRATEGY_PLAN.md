# SEO Strategy Plan: Luminary Resorts
**Brand:** Luminary Resorts @ Hilltop  
**Domain:** luminaryresorts.com  
**Date:** January 2025  
**Prepared by:** SEO Director + Technical SEO Engineer

---

## (A) Executive Summary

### What Matters Most + Why

**Primary Goal:** Rank for high-intent "book now" searches from Houston-area couples seeking romantic luxury getaways, while building topical authority that drives direct bookings and reduces OTA dependence.

**Why This Matters:**
- Current state: <500 monthly organic visits, >70% bookings via OTAs (high commission costs)
- Opportunity: Houston metro (7M+ population) has strong demand for weekend escapes; "luxury tiny house" + "romantic getaway" searches are growing
- Competitive advantage: Unique positioning (luxury tiny house + private pools + healing focus) differentiates from generic cabins/hotels
- Scalability: Foundation must support future locations (NY, other metros) without major rebuilds

**Top 3 Priorities (0-90 days):**
1. **Technical SEO Foundation** - Fix indexation, add structured data, optimize Core Web Vitals (enables all other efforts)
2. **On-Page Optimization** - Unique, conversion-focused content for each cabin + location pages (immediate ranking potential)
3. **Content Hub Creation** - "Houston romantic getaway" + "Lake Livingston weekend" guides (captures informational intent, builds authority)

**Expected Timeline to Impact:**
- **0-30 days:** Technical fixes + on-page optimization → improved indexation, better rankings for branded terms
- **31-90 days:** Content hub + local SEO → 2-5x traffic growth, ranking for "Houston weekend getaway" variants
- **3-6 months:** Link building + topical authority → ranking for competitive terms like "luxury tiny house Texas"
- **6-12 months:** Multi-location expansion → scalable template for future properties

---

## (B) Assumptions + Open Questions

### Assumptions (Proceeding With)

1. **Current State:**
   - <500 monthly organic visits (baseline)
   - >70% bookings via OTAs (target: flip to >50% direct)
   - Limited content creation resources (prioritize high-impact content)
   - Next.js App Router with Tailwind CSS
   - GA4 + Google Search Console access
   - No existing structured data implementation
   - Basic metadata only in root layout

2. **Technical:**
   - Site is indexable (need to verify robots.txt, sitemap)
   - Images are optimized via Vercel Image Optimization
   - No canonicalization issues (need audit)
   - Booking engine is functional (Hostaway integration)

3. **Content:**
   - Cabin descriptions exist but may need SEO enhancement
   - Location page exists but needs expansion
   - No blog/content hub yet
   - No experience-focused pages yet

4. **Competitive:**
   - Competitors include: generic cabin rentals, glamping sites, boutique hotels near Houston
   - "Luxury tiny house" is emerging category (less competition)
   - Local SEO competition is moderate (Point Blank is small, but Houston-area is competitive)

### High-Impact Questions (Please Answer for Refinement)

1. **Current Performance:**
   - What are your top 10 current organic keywords (if any)?
   - Do you have any existing backlinks? (rough count/quality)
   - What's your current Google Business Profile status? (if applicable)

2. **Business Priorities:**
   - What's your target direct booking percentage in 12 months? (e.g., 60% direct, 40% OTA)
   - What's the average booking value? (helps prioritize high-intent keywords)
   - Are there seasonal booking patterns? (e.g., summer peak, Valentine's Day spike)

3. **Content & Resources:**
   - Do you have professional photography of the cabins, location, nearby attractions? (for content creation)
   - Can you provide guest testimonials/reviews for E-E-A-T? (for review schema, content)
   - Do you have partnerships with local businesses (wineries, restaurants, activities)? (for link building)

4. **Technical:**
   - Do you have access to server logs? (for crawl budget analysis)
   - Are there any canonicalization issues you're aware of? (e.g., www vs non-www, trailing slashes)
   - Do you have a staging environment for testing? (for technical changes)

5. **Competitive Intelligence:**
   - Who are your top 3 direct competitors? (for benchmarking)
   - What do they rank for that you want to target?
   - Are you listed on any directories/OTAs that might create duplicate content issues?

6. **Future Expansion:**
   - When do you plan to launch the NY location? (affects URL structure planning)
   - Will future locations have the same cabin names? (affects canonicalization strategy)
   - Do you plan to expand to other metros? (affects scalable architecture)

7. **Measurement:**
   - What's your current conversion rate on the booking funnel? (baseline for CRO improvements)
   - Do you track phone calls as conversions? (for local SEO measurement)
   - What's your target cost per acquisition (CPA) for direct bookings?

8. **Content Preferences:**
   - What tone should content take? (romantic/poetic vs practical/informative vs both)
   - Are there any topics to avoid? (e.g., party-focused content if you want quiet/romantic positioning)
   - Do you have brand guidelines for imagery/voice?

9. **Link Building:**
   - Are you open to partnerships with local influencers/bloggers? (for link building)
   - Do you have a PR budget for press outreach? (for digital PR)
   - Are there any industry associations you're part of? (for directory listings)

10. **Local SEO:**
    - Do you have a physical address/office for Google Business Profile? (or is it residential-only)
    - Are you open to guest reviews on Google? (for local SEO)
    - Do you have NAP (Name, Address, Phone) consistency across all platforms?

---

## (C) Full SEO Plan with Prioritized Roadmap

### Phase 1: Foundation (0-30 Days) - "Quick Wins + Technical Fixes"

**Goal:** Fix critical technical issues, optimize existing pages, establish measurement baseline.

#### Week 1-2: Technical SEO Audit & Fixes

**Tasks:**
1. **Robots.txt & Sitemap**
   - Create `app/robots.ts` (Next.js App Router)
   - Create `app/sitemap.ts` (dynamic sitemap generation)
   - Verify no blocking of important pages
   - Submit to Google Search Console

2. **Metadata Implementation**
   - Add dynamic metadata to all cabin pages (`app/stay/[slug]/page.tsx`)
   - Add metadata to location page (`app/location/page.tsx`)
   - Add metadata to about, FAQ, contact pages
   - Implement Open Graph + Twitter Cards

3. **Structured Data (Schema.org)**
   - Implement `LodgingBusiness` schema on homepage
   - Implement `Hotel` or `VacationRental` schema on cabin pages
   - Implement `LocalBusiness` schema on location page
   - Add `BreadcrumbList` to all pages
   - Add `FAQPage` schema to FAQ page
   - Add `Review` schema (if reviews exist)

4. **Core Web Vitals Optimization**
   - Audit LCP, CLS, INP (use PageSpeed Insights)
   - Optimize images (already using Next.js Image, verify sizes)
   - Minimize render-blocking resources
   - Implement lazy loading for below-fold content

5. **Canonicalization**
   - Ensure consistent trailing slash usage
   - Add canonical tags to all pages
   - Handle www vs non-www (choose one, redirect other)
   - Prevent duplicate content from OTA listings (if applicable)

**Deliverables:**
- Technical SEO audit report
- Fixed robots.txt, sitemap, metadata
- Structured data implementation
- Core Web Vitals baseline + improvements

#### Week 3-4: On-Page Optimization

**Tasks:**
1. **Homepage Optimization**
   - Optimize title tag, meta description, H1
   - Add internal links to key pages
   - Enhance content with target keywords (natural integration)
   - Add trust signals (reviews, press mentions if any)

2. **Cabin Page Optimization (4 pages: Moss, Mist, Sol, Dew)**
   - Unique title tags per cabin (include location + USP)
   - Unique meta descriptions (CTR-focused)
   - Optimize H1/H2 structure
   - Add internal links to related content
   - Enhance image alt text
   - Add "Book Now" CTAs with tracking

3. **Location Page Enhancement**
   - Expand content (currently basic)
   - Add "Nearby Attractions" section (already exists, enhance)
   - Add "How to Get Here" section (driving times, directions)
   - Add "Why Coldspring" section (differentiation)
   - Internal links to cabin pages, experiences

4. **Internal Linking Structure**
   - Create hub/spoke model (Location hub → Cabin pages → Experiences)
   - Add contextual internal links (3-5 per page)
   - Create footer navigation with key pages
   - Add breadcrumbs (visual + schema)

**Deliverables:**
- Optimized on-page content for all existing pages
- Internal linking structure implemented
- Enhanced location page

**Success Metrics:**
- All pages indexed in GSC
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- 20-30% increase in organic impressions (GSC)
- Improved rankings for branded terms

---

### Phase 2: Content Hub + Local SEO (31-90 Days) - "Traffic Growth"

**Goal:** Build topical authority, capture informational intent, improve local visibility.

#### Month 2: Content Hub Creation

**Tasks:**
1. **Create Blog/Guides Hub**
   - Create `app/guides/page.tsx` (hub page)
   - Create `app/guides/[slug]/page.tsx` (dynamic route)
   - Implement category taxonomy (Romantic Getaways, Area Guides, Travel Tips)

2. **Priority Content (Top 10 Articles)**
   - "Ultimate Houston Romantic Getaway Guide 2025" (target: "Houston romantic getaway")
   - "Lake Livingston Weekend Itinerary: 3-Day Escape" (target: "Lake Livingston weekend")
   - "Best Romantic Cabins Near Houston with Private Pools" (target: "romantic cabins Houston")
   - "Coldspring, Texas: Hidden Gem for Couples Retreats" (target: "Coldspring Texas")
   - "Sam Houston National Forest: Hiking & Nature Guide" (target: "Sam Houston National Forest")
   - "Luxury Tiny House Getaways: Why Size Doesn't Matter" (target: "luxury tiny house")
   - "Digital Detox Weekend: Unplugging in East Texas" (target: "digital detox Texas")
   - "Anniversary Getaway Ideas Near Houston" (target: "anniversary getaway Houston")
   - "Proposal Spots Near Houston: Romantic Locations" (target: "proposal spots Houston")
   - "Why Choose a Tiny House Over a Hotel for Your Getaway" (target: "tiny house vs hotel")

3. **Experience Pages**
   - Create `app/experiences/page.tsx` (hub)
   - Create individual experience pages:
     - `/experiences/romantic-getaway`
     - `/experiences/couples-retreat`
     - `/experiences/anniversary-celebration`
     - `/experiences/digital-detox`
     - `/experiences/proposal-package`

4. **Area Guide Pages**
   - Enhance location page with sub-pages:
     - `/location/lake-livingston` (detailed guide)
     - `/location/sam-houston-forest` (detailed guide)
     - `/location/things-to-do` (activities hub)

**Deliverables:**
- 10 priority blog articles (1,500-2,500 words each)
- 5 experience pages
- 3 area guide pages
- Internal linking between all content

#### Month 3: Local SEO + Link Building Foundation

**Tasks:**
1. **Local SEO Implementation**
   - Google Business Profile optimization (if applicable)
   - NAP consistency audit + fixes
   - Local citations (Yelp, TripAdvisor, regional directories)
   - "Near Houston" content optimization
   - Map embeds on location page

2. **Link Building (Foundation)**
   - Create linkable assets:
     - "Houston Romantic Getaway Guide" (infographic or comprehensive guide)
     - "Lake Livingston Weekend Itinerary" (downloadable PDF)
   - Outreach to 20-30 targets:
     - Texas travel blogs
     - Houston lifestyle publications
     - Glamping/luxury travel directories
     - Regional tourism organizations

3. **Review Strategy**
   - Implement review schema (if reviews exist)
   - Create review collection process
   - Add testimonials to cabin pages

**Deliverables:**
- Local SEO foundation established
- 5-10 quality backlinks acquired
- Review collection process implemented

**Success Metrics:**
- 2-5x increase in organic traffic (from <500 to 1,000-2,500/month)
- Ranking in top 20 for "Houston romantic getaway" variants
- 10+ quality backlinks acquired
- Improved local pack visibility (if applicable)

---

### Phase 3: Authority Building (3-6 Months) - "Competitive Rankings"

**Goal:** Rank for competitive terms, build domain authority, scale content.

#### Months 4-6: Content Scaling + Link Building

**Tasks:**
1. **Content Calendar Execution**
   - Publish 2-4 articles per month
   - Seasonal content (Valentine's Day, summer, holidays)
   - Programmatic SEO opportunities (area guides, itinerary templates)

2. **Link Building (Intensive)**
   - Digital PR campaigns (2-3 per quarter)
   - Partnership outreach (photographers, influencers, local businesses)
   - Guest posting on relevant blogs
   - Directory submissions (ethical, high-quality only)

3. **Topical Authority Expansion**
   - Create topic clusters around:
     - Romantic getaways (hub: `/experiences/romantic-getaway`)
     - Luxury tiny houses (hub: `/guides/luxury-tiny-house`)
     - Houston weekend escapes (hub: `/location`)
   - Internal linking between clusters

4. **Technical Enhancements**
   - Implement advanced schema (VideoObject for property tours, if applicable)
   - A/B test page layouts for conversion
   - Implement internal site search (if needed)
   - Monitor and fix crawl budget issues

**Deliverables:**
- 15-20 additional blog articles
- 20-30 quality backlinks
- Topic clusters established
- Advanced schema implemented

**Success Metrics:**
- 5,000-10,000 monthly organic visits
- Ranking in top 10 for "luxury tiny house Texas"
- 30+ quality backlinks
- Domain Authority (DA) increase of 5-10 points

---

### Phase 4: Multi-Location Scalability (6-12 Months) - "Expansion Ready"

**Goal:** Prepare for multi-location expansion, maintain rankings, scale operations.

#### Months 7-12: Scalability + Optimization

**Tasks:**
1. **Multi-Location Architecture**
   - Create location template system
   - URL structure: `/locations/[location-slug]/[cabin-slug]`
   - Programmatic page generation for new locations
   - Location-specific schema implementation

2. **Content Expansion**
   - Location-specific content for each new market
   - Cross-location internal linking
   - Comparison content (e.g., "Texas vs NY locations")

3. **Advanced Optimization**
   - Conversion rate optimization (CRO) based on data
   - Advanced analytics implementation
   - Personalization (if applicable)
   - Internationalization prep (if needed)

4. **Ongoing Maintenance**
   - Monthly content publishing
   - Quarterly link building campaigns
   - Technical SEO audits (quarterly)
   - Competitor monitoring

**Deliverables:**
- Scalable location template
- 30+ total blog articles
- 50+ quality backlinks
- Multi-location SEO framework

**Success Metrics:**
- 10,000+ monthly organic visits
- >50% direct bookings (reduced OTA dependence)
- Ranking in top 5 for primary target keywords
- Successful launch of NY location with SEO foundation

---

## (D) Backlog Table

| Task | Impact | Effort | Owner | Dependencies | Acceptance Criteria |
|------|--------|--------|-------|--------------|-------------------|
| Create robots.txt + sitemap | High | Low | Dev | None | All pages crawlable, sitemap submitted to GSC |
| Implement structured data (LodgingBusiness) | High | Medium | Dev | None | Schema validated in Google Rich Results Test |
| Add dynamic metadata to cabin pages | High | Low | Dev | None | Unique title/description per cabin, OG tags working |
| Optimize Core Web Vitals | High | Medium | Dev | None | LCP < 2.5s, CLS < 0.1, INP < 200ms (PageSpeed Insights) |
| Enhance location page content | High | Medium | Content | Location research | 1,500+ words, internal links, target keywords |
| Create "Houston Romantic Getaway" guide | High | High | Content | Photography | 2,000+ words, ranking in top 20, 5+ internal links |
| Create experience pages (5 pages) | Medium | Medium | Content | None | Unique content per page, internal links, CTAs |
| Implement breadcrumbs (visual + schema) | Medium | Low | Dev | None | Breadcrumbs visible, BreadcrumbList schema validated |
| Google Business Profile setup | High | Low | Marketing | Business verification | Profile live, NAP consistent, categories set |
| Local citations (10 directories) | Medium | Low | Marketing | NAP data | Listed on Yelp, TripAdvisor, regional directories |
| Create linkable asset (Houston Guide) | High | High | Content | Design resources | Comprehensive guide, downloadable format |
| Outreach to 20 travel blogs | Medium | High | Marketing | Linkable asset | 5+ quality backlinks acquired |
| Add review schema to cabin pages | Medium | Low | Dev | Review data | Review schema validated, reviews displaying |
| Create blog hub page | Medium | Low | Dev | Blog articles | Hub page live, category taxonomy working |
| Implement FAQPage schema | Low | Low | Dev | FAQ content | Schema validated, FAQ displaying correctly |
| Create "Lake Livingston Weekend" guide | High | High | Content | Location research | 2,000+ words, ranking in top 20 |
| Add internal linking to all pages | High | Medium | Content/Dev | All pages exist | 3-5 contextual internal links per page |
| Optimize image alt text (all images) | Medium | Low | Content | Image inventory | All images have descriptive alt text |
| Create seasonal content (Valentine's) | Medium | Medium | Content | Seasonal timing | Article published 2 weeks before holiday |
| Implement advanced schema (VideoObject) | Low | Medium | Dev | Video content | Schema validated, videos embedded |
| A/B test booking CTA placement | Medium | Medium | Dev/Marketing | Analytics setup | CTA placement tested, winner implemented |
| Create location template for scalability | High | High | Dev | Multi-location plan | Template works for NY location launch |
| Programmatic SEO for area guides | Medium | High | Dev/Content | Content strategy | 10+ area guide pages generated |
| Monthly content publishing (2-4 articles) | High | High | Content | Content calendar | Articles published on schedule |
| Quarterly link building campaigns | High | High | Marketing | Linkable assets | 5-10 quality links per quarter |
| Technical SEO audit (quarterly) | Medium | Medium | SEO/Dev | GSC access | Audit completed, issues fixed |

---

## (E) Copy-Ready Recommendations

### Homepage

**Title Tag (60 chars):**
```
Luminary Resorts | Luxury Tiny House Retreat Near Houston, TX
```

**Meta Description (155 chars):**
```
Private hilltop retreat for couples. Four luxury tiny houses with private pools, floor-to-ceiling windows, and complete privacy. 1 hour from Houston. Book direct.
```

**H1:**
```
Where Silence Reflects Love
```

**H2 Structure:**
- Our Cabins (with cabin previews)
- The Experience (romance, healing, nature)
- Location (near Houston, Lake Livingston)
- Book Your Stay

---

### Cabin Pages (Template)

**Title Tag Formula:**
```
[Cabin Name] | Luxury Tiny House with [Key Feature] | Luminary Resorts, TX
```

**Examples:**
- **Moss:** `Moss | Luxury Glass Cabin with Forest Views | Luminary Resorts, TX`
- **Dew:** `Dew | Private Pool + Zen Design | Luminary Resorts Near Houston`
- **Sol:** `Sol | Hilltop Cabin with Panoramic Views | Luminary Resorts, TX`
- **Mist:** `Mist | Lakefront Tiny House Retreat | Luminary Resorts, Texas`

**Meta Description Formula:**
```
[Unique selling point] in [location]. [Key amenities]. Perfect for [target audience]. Book direct and save. [Call to action].
```

**Examples:**
- **Moss:** `Contemporary glass sanctuary with floor-to-ceiling windows framing the forest. King bed, private deck, luxury amenities. Romantic getaway 1 hour from Houston. Book now.`
- **Dew:** `Asian Zen-inspired cabin with private pool and treetop views. Skylight over bed, EV charger, complete privacy. Perfect for couples seeking tranquility. Direct booking available.`

**H1:**
```
[Cabin Name]
```

**H2 Structure:**
- About [Cabin Name]
- Amenities
- The Experience
- Location & Views
- Book Your Stay

**Image Alt Text Examples:**
- `Moss cabin exterior with floor-to-ceiling windows and forest views`
- `Dew cabin private pool with treetop panorama, Luminary Resorts`
- `Sol cabin interior with king bed and panoramic windows`
- `Mist cabin lakefront deck with sunset views`

---

### Location Page

**Title Tag:**
```
Location | Luminary Resorts at Hilltop | Coldspring, Texas Near Houston
```

**Meta Description:**
```
Hidden in East Texas hilltop, 1 hour from Houston. Near Lake Livingston and Sam Houston National Forest. Secluded luxury tiny house retreat for couples. Directions & map.
```

**H1:**
```
Coldspring, Texas
```

**H2 Structure:**
- Where to Find Us
- Nearby Natural Wonders
- How to Get Here
- Why Coldspring

---

### Experience Pages

**Romantic Getaway Page:**

**Title Tag:**
```
Romantic Getaway Near Houston | Luxury Tiny House Retreat | Luminary Resorts
```

**Meta Description:**
```
Ultimate romantic getaway 1 hour from Houston. Private pools, floor-to-ceiling windows, complete seclusion. Perfect for anniversaries, proposals, and reconnection. Book now.
```

**H1:**
```
Romantic Getaway for Couples
```

---

### Blog/Guide Pages

**Houston Romantic Getaway Guide:**

**Title Tag:**
```
Ultimate Houston Romantic Getaway Guide 2025 | Luxury Cabins & Retreats
```

**Meta Description:**
```
Discover the best romantic getaways near Houston. Luxury tiny houses, private pools, and secluded retreats perfect for couples. Complete guide with itineraries and tips.
```

**H1:**
```
Ultimate Houston Romantic Getaway Guide 2025
```

---

### URL Structure Recommendations

**Current Structure (Keep):**
- `/` - Homepage
- `/stay/[slug]` - Cabin pages (e.g., `/stay/moss`)
- `/location` - Location page
- `/about` - About page
- `/faq` - FAQ page
- `/contact` - Contact page
- `/gallery` - Gallery page

**New Structure (Add):**
- `/guides` - Blog hub
- `/guides/[slug]` - Individual articles (e.g., `/guides/houston-romantic-getaway`)
- `/experiences` - Experiences hub
- `/experiences/[slug]` - Individual experiences (e.g., `/experiences/romantic-getaway`)
- `/location/lake-livingston` - Area guide sub-page
- `/location/sam-houston-forest` - Area guide sub-page
- `/location/things-to-do` - Activities hub

**Future Multi-Location Structure:**
- `/locations/[location-slug]` - Location hub (e.g., `/locations/texas-hilltop`)
- `/locations/[location-slug]/[cabin-slug]` - Cabin pages (e.g., `/locations/texas-hilltop/moss`)

---

## (F) Measurement Plan

### KPIs & Targets

**Traffic Metrics:**
- **Organic Sessions:** Baseline <500/month → Target 2,500/month (90 days), 10,000/month (12 months)
- **Branded vs Non-Branded:** Target 70% non-branded (currently likely 90%+ branded)
- **Top 10 Keyword Rankings:** Target 5+ keywords in top 10 (90 days), 20+ keywords (12 months)

**Conversion Metrics:**
- **Direct Booking Rate:** Baseline <30% → Target 50%+ (12 months)
- **Booking Conversion Rate:** Baseline (TBD) → Target 3-5% (improve by 50%)
- **Cost Per Acquisition (CPA):** Target <$50 (vs OTA commissions of $100+)

**Authority Metrics:**
- **Domain Authority (DA):** Target +5-10 points (12 months)
- **Backlinks:** Target 50+ quality backlinks (12 months)
- **Referring Domains:** Target 30+ unique domains (12 months)

**Technical Metrics:**
- **Core Web Vitals:** LCP < 2.5s, CLS < 0.1, INP < 200ms (maintain)
- **Indexation Rate:** 100% of important pages indexed
- **Crawl Errors:** <5 errors in GSC

---

### GA4 Event Tracking

**Booking Funnel Events:**
```javascript
// View Cabin
gtag('event', 'view_cabin', {
  'cabin_name': 'Moss',
  'cabin_slug': 'moss',
  'page_location': window.location.href
});

// Start Booking
gtag('event', 'start_booking', {
  'cabin_name': 'Moss',
  'check_in': '2025-02-14',
  'check_out': '2025-02-16',
  'guests': 2
});

// View Booking Review
gtag('event', 'view_booking_review', {
  'cabin_name': 'Moss',
  'total_price': 450.00,
  'nights': 2
});

// Complete Booking
gtag('event', 'purchase', {
  'transaction_id': 'LR-12345678',
  'value': 450.00,
  'currency': 'USD',
  'cabin_name': 'Moss',
  'check_in': '2025-02-14',
  'check_out': '2025-02-16'
});

// Submit Inquiry
gtag('event', 'submit_inquiry', {
  'cabin_name': 'Moss',
  'check_in': '2025-02-14',
  'check_out': '2025-02-16'
});
```

**Content Engagement Events:**
```javascript
// View Guide Article
gtag('event', 'view_guide', {
  'guide_title': 'Houston Romantic Getaway Guide',
  'guide_category': 'Area Guides'
});

// Click Internal Link
gtag('event', 'click_internal_link', {
  'link_text': 'Book Moss Cabin',
  'destination_page': '/stay/moss'
});
```

---

### Google Search Console Segmentation

**Branded vs Non-Branded Queries:**
- **Branded:** "luminary resorts", "luminary resorts texas", "luminary resorts hilltop"
- **Non-Branded:** "luxury tiny house texas", "romantic getaway houston", "lake livingston cabins"

**Query Clusters:**
- Transactional: "book", "reserve", "rental", "cabin"
- Informational: "guide", "things to do", "weekend", "getaway"
- Local: "near houston", "texas", "lake livingston", "coldspring"

---

### Reporting Cadence

**Weekly:**
- Organic traffic (sessions, users, pageviews)
- Top 10 keyword rankings
- GSC impressions/clicks (branded vs non-branded)
- Booking funnel conversion rate
- Core Web Vitals (if changes made)

**Monthly:**
- Full traffic report (organic, direct, referral)
- Keyword ranking changes (top 50 keywords)
- Backlink acquisition (new links, lost links)
- Content performance (top 10 pages)
- Conversion metrics (bookings, inquiries, revenue)
- Technical SEO health (crawl errors, indexation)

**Quarterly:**
- Comprehensive SEO audit
- Competitor analysis
- Content performance review
- Link building campaign results
- ROI analysis (organic revenue vs investment)

---

### Dashboards

**Primary Dashboard (GA4):**
- Organic traffic trend (last 30 days)
- Top 10 landing pages
- Booking funnel conversion rate
- Top 10 organic keywords
- Device/category breakdown

**SEO Dashboard (GSC + GA4):**
- Impressions, clicks, CTR, average position
- Top queries (branded vs non-branded)
- Top pages by clicks
- Index coverage
- Core Web Vitals

**Conversion Dashboard:**
- Direct bookings (revenue, count)
- OTA bookings (for comparison)
- Booking conversion rate
- Cost per acquisition (organic)
- Revenue attribution (organic vs paid)

---

## Quick Wins in 7 Days

1. **Add dynamic metadata to cabin pages** (2 hours)
   - Update `app/stay/[slug]/page.tsx` with `generateMetadata` function
   - Unique title/description per cabin

2. **Create robots.txt and sitemap** (1 hour)
   - Create `app/robots.ts` and `app/sitemap.ts`
   - Submit to Google Search Console

3. **Implement basic structured data** (3 hours)
   - Add `LodgingBusiness` schema to homepage
   - Add `Hotel` schema to cabin pages
   - Add `BreadcrumbList` to all pages

4. **Enhance location page content** (4 hours)
   - Expand from current basic content to 1,500+ words
   - Add internal links to cabin pages
   - Optimize for "Coldspring Texas" + "near Houston"

5. **Fix internal linking** (2 hours)
   - Add 3-5 contextual internal links per page
   - Create footer navigation with key pages

6. **Optimize image alt text** (2 hours)
   - Add descriptive alt text to all images
   - Include keywords naturally

7. **Submit sitemap to GSC** (15 minutes)
   - Verify site ownership
   - Submit sitemap URL

**Total Time:** ~14 hours  
**Expected Impact:** Improved indexation, better rankings for branded terms, foundation for future growth

---

## Implementation Examples

### Example 1: Dynamic Metadata for Cabin Pages

**File:** `app/stay/[slug]/page.tsx`

```typescript
import { Metadata } from 'next'
import { getCabinBySlug } from '@/lib/cabins'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cabin = await getCabinBySlug(slug)
  
  if (!cabin) {
    return {
      title: 'Cabin Not Found | Luminary Resorts',
    }
  }

  const title = `${cabin.name} | Luxury Tiny House with ${getKeyFeature(cabin)} | Luminary Resorts, TX`
  const description = `${cabin.description.substring(0, 120)}... Perfect for couples seeking ${getTargetAudience(cabin)}. Book direct and save.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [cabin.images[0]],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cabin.images[0]],
    },
  }
}

function getKeyFeature(cabin: Cabin): string {
  // Return unique feature per cabin for title tag
  const features: Record<string, string> = {
    moss: 'Forest Views',
    dew: 'Private Pool',
    sol: 'Panoramic Views',
    mist: 'Lakefront Access',
  }
  return features[cabin.slug] || 'Luxury Amenities'
}

function getTargetAudience(cabin: Cabin): string {
  // Return target audience for meta description
  return 'romance and tranquility'
}
```

---

### Example 2: Structured Data (LodgingBusiness Schema)

**File:** `app/layout.tsx` or create `components/structured-data.tsx`

```typescript
export function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Luminary Resorts at Hilltop",
    "description": "Luxury tiny house retreat for couples in Coldspring, Texas",
    "url": "https://luminaryresorts.com",
    "logo": "https://luminaryresorts.com/icon.png",
    "image": "https://luminaryresorts.com/hero-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "50 Snowhill Rd",
      "addressLocality": "Coldspring",
      "addressRegion": "TX",
      "postalCode": "77331",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "30.5885",
      "longitude": "-95.1294"
    },
    "telephone": "+14045908346",
    "priceRange": "$$$",
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Private Pool",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "EV Charging",
        "value": true
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

### Example 3: Sitemap Generation

**File:** `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'
import { cabins } from '@/lib/cabins'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://luminaryresorts.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/location`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Cabin pages
  const cabinPages = cabins.map((cabin) => ({
    url: `${baseUrl}/stay/${cabin.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...cabinPages]
}
```

---

### Example 4: Robots.txt

**File:** `app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/tools/', '/booking/'],
      },
    ],
    sitemap: 'https://luminaryresorts.com/sitemap.xml',
  }
}
```

---

## Next Steps

1. **Review this plan** and answer the 10 questions in Section (B)
2. **Prioritize Phase 1 tasks** (0-30 days) based on resources
3. **Set up measurement** (GA4 events, GSC access)
4. **Begin implementation** with Quick Wins (7 days)
5. **Schedule weekly check-ins** to track progress

---

## If You Answer These 10 Questions, I Will Refine This Plan Further

1. What are your top 10 current organic keywords (if any)?
2. Do you have any existing backlinks? (rough count/quality)
3. What's your current Google Business Profile status? (if applicable)
4. What's your target direct booking percentage in 12 months?
5. What's the average booking value?
6. Do you have professional photography of cabins, location, nearby attractions?
7. Can you provide guest testimonials/reviews for E-E-A-T?
8. Do you have partnerships with local businesses (wineries, restaurants, activities)?
9. Who are your top 3 direct competitors?
10. When do you plan to launch the NY location?

---

**End of SEO Strategy Plan**
