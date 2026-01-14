# Vercel Deployment Checklist

Use this checklist to track your deployment progress. Check off each item as you complete it.

## Pre-Deployment

- [ ] Code is pushed to GitHub (`git push origin main`)
- [ ] All local changes are committed
- [ ] Repository is accessible on GitHub
- [ ] `.env.local` is in `.gitignore` (verified)

## Vercel Account Setup

- [ ] Vercel account created at https://vercel.com/signup
- [ ] GitHub account connected to Vercel
- [ ] Vercel has access to your repository

## Project Import

- [ ] Project imported to Vercel from GitHub
- [ ] Project name set: `luminary-resorts` (or your choice)
- [ ] Framework auto-detected as Next.js
- [ ] Build command set: `pnpm build` (or `npm run build`)
- [ ] Install command set: `pnpm install` (or `npm install`)
- [ ] **DO NOT DEPLOY YET** - wait for database setup

## Database Setup

- [ ] Vercel Postgres database created
- [ ] Database name: `luminary-resorts-db`
- [ ] Region selected (e.g., `us-east-1`)
- [ ] Database provisioned and running
- [ ] `POSTGRES_URL` copied from database `.env.local` tab

## Database Migrations

- [ ] Migration `001_initial_schema.sql` executed in Vercel Postgres Query tab
- [ ] Migration `002_add_calendar_reservations.sql` executed
- [ ] Verified tables exist: `bookings`, `calendar_cache`, `booking_modifications`
- [ ] Verified `calendar_cache` has `reservations` and `minimum_stay` columns

## Environment Variables

- [ ] `POSTGRES_URL` added to Production, Preview, Development
- [ ] `STRIPE_SECRET_KEY` added (production key for Production, test key for Preview/Dev)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` added (production key for Production, test key for Preview/Dev)
- [ ] `HOSTAWAY_CLIENT_ID` added to all environments
- [ ] `HOSTAWAY_CLIENT_SECRET` added to all environments
- [ ] `GMAIL_USER` added to all environments
- [ ] `GMAIL_APP_PASSWORD` added to all environments
- [ ] `NODE_ENV=production` added to Production
- [ ] All sensitive variables marked as "Encrypted"
- [ ] **Note**: `STRIPE_WEBHOOK_SECRET` will be added after webhook creation

## Initial Deployment

- [ ] Deployment triggered (clicked Deploy or pushed to main)
- [ ] Build completed successfully
- [ ] No build errors in logs
- [ ] Deployment URL accessible: `https://your-project.vercel.app`

## Basic Functionality Test

- [ ] Home page loads correctly
- [ ] Cabin detail pages load
- [ ] Navigation works
- [ ] Images display correctly
- [ ] No console errors in browser

## Stripe Webhook Setup

- [ ] Deployment URL noted: `https://your-project.vercel.app`
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook URL: `https://your-project.vercel.app/api/payment/webhook`
- [ ] Events selected: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
- [ ] Webhook signing secret copied (`whsec_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel environment variables
- [ ] Application redeployed to pick up webhook secret
- [ ] Webhook tested with test payment
- [ ] Webhook events received in Stripe Dashboard

## Custom Domain Setup

- [ ] Domain added to Vercel project (Settings → Domains)
- [ ] DNS records configured at domain registrar
- [ ] DNS propagation completed (checked with `nslookup` or `dig`)
- [ ] SSL certificate issued (check Domains tab)
- [ ] Site accessible at custom domain: `https://luminaryresorts.com`
- [ ] Stripe webhook URL updated to use custom domain
- [ ] Webhook tested with custom domain

## Post-Deployment Testing

### Database Connectivity
- [ ] Calendar loads on cabin detail page
- [ ] No database errors in Vercel function logs
- [ ] Calendar cache populating (check database)

### Booking Flow
- [ ] Date selection works on cabin page
- [ ] Pricing calculates correctly
- [ ] Review page shows correct pricing
- [ ] Guest info form works
- [ ] Payment form loads (Stripe Elements)
- [ ] Test payment successful (card: `4242 4242 4242 4242`)
- [ ] Booking confirmation page displays
- [ ] Booking stored in database

### Email System
- [ ] Contact form submission sends email
- [ ] Booking confirmation email sent
- [ ] Email formatting correct
- [ ] Email addresses correct (lydia@luminaryresorts.com)

### Calendar Sync
- [ ] Calendar displays correct availability
- [ ] Dates blocked/available match Hostaway
- [ ] Availability search on home page works
- [ ] Calendar cache updating

### Performance
- [ ] Page load times acceptable
- [ ] Images optimized
- [ ] API response times reasonable
- [ ] No function timeout errors

## Monitoring Setup

- [ ] Vercel Analytics enabled (already in code)
- [ ] Function logs accessible
- [ ] Database monitoring dashboard checked
- [ ] Backup settings verified (automatic with Vercel Postgres)

## Production Readiness

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Build succeeds without errors
- [ ] Production Stripe keys configured
- [ ] Webhook endpoint working
- [ ] Test payments working
- [ ] Email confirmations sending
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] All functionality tested
- [ ] No critical errors in logs

## Success Criteria Met

- [ ] ✅ Site accessible at custom domain
- [ ] ✅ All pages load correctly
- [ ] ✅ Calendar syncs with Hostaway
- [ ] ✅ Booking flow works end-to-end
- [ ] ✅ Payments process successfully
- [ ] ✅ Email confirmations sent
- [ ] ✅ Database stores bookings correctly
- [ ] ✅ No critical errors in logs
- [ ] ✅ SSL certificate active
- [ ] ✅ Webhook events received

## Post-Launch

- [ ] Monitor deployments weekly
- [ ] Review function logs for errors
- [ ] Check database health monthly
- [ ] Update dependencies monthly (test before deploying)
- [ ] Verify backups working (automatic)

---

**Deployment Date**: _______________

**Deployment URL**: _______________

**Custom Domain**: _______________

**Notes**: 
_________________________________________________
_________________________________________________
_________________________________________________
