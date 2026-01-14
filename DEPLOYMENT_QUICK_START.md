# Vercel Deployment Quick Start

This is a condensed version of the full deployment guide. For detailed instructions, see `VERCEL_DEPLOYMENT.md`.

## Prerequisites

- [ ] GitHub repository with code pushed
- [ ] Vercel account (sign up at vercel.com)
- [ ] Stripe account with API keys
- [ ] Hostaway API credentials
- [ ] Gmail account with App Password (see `GMAIL_SETUP.md`)

## Deployment Steps

### 1. Import Project to Vercel
- Go to https://vercel.com/new
- Import `luminary-resorts-ui-2` repository
- **DO NOT deploy yet**

### 2. Create Database
- Vercel Dashboard → Storage → Create Database → Postgres
- Name: `luminary-resorts-db`
- Region: `us-east-1` (or closest to users)
- Copy `POSTGRES_URL` from database `.env.local` tab

### 3. Run Migrations
- Database Dashboard → Query tab
- Run `lib/db/migrations/001_initial_schema.sql`
- Run `lib/db/migrations/002_add_calendar_reservations.sql`
- Verify tables created

### 4. Set Environment Variables
See `ENV_VARIABLES_TEMPLATE.md` for complete list.

**Required for all environments:**
- `POSTGRES_URL` (from database)
- `STRIPE_SECRET_KEY` (production for Production, test for others)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (production for Production, test for others)
- `HOSTAWAY_CLIENT_ID`
- `HOSTAWAY_CLIENT_SECRET`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `NODE_ENV=production` (Production only)

### 5. Deploy
- Click "Deploy" in Vercel dashboard
- Wait for build to complete (2-5 minutes)
- Verify deployment URL works

### 6. Setup Stripe Webhook
- Stripe Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://your-project.vercel.app/api/payment/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
- Copy signing secret → Add as `STRIPE_WEBHOOK_SECRET` in Vercel
- Redeploy

### 7. Configure Custom Domain
- Vercel → Settings → Domains → Add domain
- Configure DNS at registrar (follow Vercel instructions)
- Wait for SSL certificate (automatic)
- Update Stripe webhook URL to use custom domain

### 8. Test Everything
- [ ] Home page loads
- [ ] Cabin pages load
- [ ] Calendar displays correctly
- [ ] Booking flow works
- [ ] Payment processes
- [ ] Email confirmations sent
- [ ] Database stores bookings

## Quick Reference

**Database Migrations:**
- `lib/db/migrations/001_initial_schema.sql`
- `lib/db/migrations/002_add_calendar_reservations.sql`

**Environment Variables:**
- See `ENV_VARIABLES_TEMPLATE.md`

**Deployment Checklist:**
- See `DEPLOYMENT_CHECKLIST.md`

**Full Guide:**
- See `VERCEL_DEPLOYMENT.md`

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Check for TypeScript errors

**Database connection fails?**
- Verify `POSTGRES_URL` is set correctly
- Check database is running
- Verify migrations were applied

**Stripe not working?**
- Verify keys are correct (production vs test)
- Check webhook secret matches
- Verify webhook URL is correct

**Email not sending?**
- Verify Gmail credentials
- Check Gmail App Password is valid
- Review function logs

## Support

For detailed instructions, troubleshooting, and best practices, see:
- `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- `ENV_VARIABLES_TEMPLATE.md` - Environment variables reference
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `GMAIL_SETUP.md` - Gmail configuration guide
