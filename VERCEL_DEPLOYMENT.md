# Vercel Deployment Guide

This guide walks you through deploying Luminary Resorts to Vercel step-by-step.

## Quick Start Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Vercel Postgres database created
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] Initial deployment successful
- [ ] Stripe webhook configured
- [ ] Custom domain configured
- [ ] All functionality tested

## Step-by-Step Instructions

### 1. Repository Preparation ✅

Your repository is ready:
- ✅ `.env.local` is in `.gitignore`
- ✅ All dependencies are in `package.json`
- ✅ Build script is configured: `"build": "next build"`
- ✅ Next.js 16.0.10 is compatible with Vercel

**Action Required**: Push your code to GitHub if not already done:
```bash
git push origin main
```

### 2. Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended for automatic deployments)
3. Authorize Vercel to access your GitHub repositories

### 3. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import" next to your `luminary-resorts-ui-2` repository
3. Vercel will auto-detect Next.js framework
4. Configure project settings:
   - **Project Name**: `luminary-resorts` (or your preferred name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (or `npm run build` if using npm)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (or `npm install`)

**⚠️ IMPORTANT**: Do NOT click "Deploy" yet! We need to set up the database first.

### 4. Create Vercel Postgres Database

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose database name: `luminary-resorts-db`
5. Select region closest to your users (e.g., `us-east-1`)
6. Click **Create**
7. Wait for database provisioning (1-2 minutes)

### 5. Get Database Connection String

1. Click on your database in Storage tab
2. Go to **.env.local** tab
3. Copy the `POSTGRES_URL` connection string
4. You'll use this in the next step

### 6. Run Database Migrations

1. In database dashboard, click **Query** tab
2. Open `lib/db/migrations/001_initial_schema.sql` from your local project
3. Copy entire SQL content
4. Paste into Query tab and click **Run**
5. Verify tables were created (bookings, calendar_cache, booking_modifications)
6. Repeat for `lib/db/migrations/002_add_calendar_reservations.sql`

**Verify migrations** by running:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see: `bookings`, `booking_modifications`, `calendar_cache`

### 7. Configure Environment Variables

1. In Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add variables for **Production**, **Preview**, and **Development** environments

#### Required Variables:

**Database:**
```
POSTGRES_URL=<from Vercel Postgres .env.local tab>
```
*Note: The code also supports `DATABASE_URL` if you prefer that name*

**Stripe (Production keys):**
```
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```
*Note: Set `STRIPE_WEBHOOK_SECRET` after creating the webhook in Step 9*

**Hostaway API:**
```
HOSTAWAY_CLIENT_ID=your_hostaway_client_id
HOSTAWAY_CLIENT_SECRET=your_hostaway_client_secret
```
*OR use pre-generated token (alternative):*
```
HOSTAWAY_ACCESS_TOKEN=your_hostaway_access_token
```

**Email (Gmail):**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

**Node Environment:**
```
NODE_ENV=production
```

#### Environment-Specific Configuration:
- **Production**: Use production Stripe keys, production Hostaway credentials
- **Preview**: Use test Stripe keys (`sk_test_`, `pk_test_`), same Hostaway credentials
- **Development**: Use test Stripe keys, same Hostaway credentials

### 8. Initial Deployment

1. Go to **Deployments** tab in Vercel dashboard
2. Click **Deploy** (or push to main branch if connected to GitHub)
3. Monitor build logs for any errors
4. Wait for deployment to complete (2-5 minutes)

**Verify Build Success:**
- Check build logs for errors
- Verify all dependencies installed correctly
- Check for TypeScript errors (currently ignored in `next.config.mjs`)
- Verify build output shows successful compilation

### 9. Test Basic Functionality

1. Visit deployment URL: `https://your-project.vercel.app`
2. Verify home page loads
3. Check cabin detail pages load
4. Test navigation between pages
5. Verify images load correctly

### 10. Configure Stripe Webhook

1. **Get Deployment URL**: Note your Vercel deployment URL: `https://your-project.vercel.app`

2. **Create Webhook in Stripe**:
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-project.vercel.app/api/payment/webhook`
   - Description: "Luminary Resorts Payment Webhook"
   - Select events to listen to:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
   - Click **Add endpoint**

3. **Get Webhook Signing Secret**:
   - Click on the newly created webhook
   - Click **Reveal** next to "Signing secret"
   - Copy the secret (starts with `whsec_`)
   - Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
   - Redeploy the application to pick up the new variable

4. **Test Webhook**:
   - Make a test payment using Stripe test card: `4242 4242 4242 4242`
   - Check Stripe Dashboard → Webhooks → Your endpoint
   - Verify webhook events are being received
   - Check Vercel function logs for webhook processing

### 11. Configure Custom Domain

1. **Add Domain to Vercel**:
   - In Vercel project, go to **Settings** → **Domains**
   - Enter your domain name (e.g., `luminaryresorts.com`)
   - Click **Add**
   - Vercel will provide DNS configuration instructions

2. **Configure DNS Records**:
   - Go to your domain registrar's DNS settings
   - Add the DNS records Vercel provides:
     - **A Record** or **CNAME** pointing to Vercel
     - Follow Vercel's specific instructions
   - Wait for DNS propagation (5 minutes to 48 hours, usually < 1 hour)

3. **SSL Certificate**:
   - Vercel automatically provisions SSL certificates via Let's Encrypt
   - Certificate is issued automatically once DNS is configured
   - Check **Domains** tab to verify certificate status

4. **Update Stripe Webhook URL**:
   - After domain is configured, update Stripe webhook URL:
     - Old: `https://your-project.vercel.app/api/payment/webhook`
     - New: `https://luminaryresorts.com/api/payment/webhook`
   - Update webhook signing secret if needed
   - Test webhook with new domain

### 12. Post-Deployment Verification

#### Database Connectivity Test
1. Visit a cabin detail page
2. Check if calendar loads (indicates database connection works)
3. Check Vercel function logs for any database errors
4. Verify calendar cache is being populated

#### Booking Flow Test
1. Select dates on a cabin page
2. Verify pricing calculates correctly
3. Proceed through booking steps:
   - Review page loads with correct pricing
   - Guest info form works
   - Payment form loads (Stripe Elements)
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete test booking
6. Verify:
   - Booking confirmation page shows
   - Email confirmation is sent
   - Booking appears in database

#### Email Functionality Test
1. Submit contact form
2. Verify emails are sent to recipients
3. Complete a test booking
4. Verify booking confirmation email is sent
5. Check email formatting and content

#### Calendar Sync Test
1. Check if calendar sync is working
2. Verify dates are correctly blocked/available
3. Test availability search on home page
4. Verify calendar cache is updating

### 13. Monitoring & Maintenance Setup

#### Enable Vercel Analytics
- Analytics is already included in your code (`@vercel/analytics`)
- Verify it's working in Vercel dashboard → Analytics tab
- Monitor page views, performance metrics

#### Set Up Log Monitoring
1. Go to **Deployments** → Select deployment → **Functions** tab
2. Monitor function logs for errors
3. Set up alerts for critical errors (optional)

#### Database Monitoring
1. In Vercel Postgres dashboard, monitor:
   - Connection count
   - Query performance
   - Storage usage
2. Set up alerts for storage limits (if applicable)

#### Backup Strategy
- Vercel Postgres includes automatic daily backups
- Backups are retained for 7 days (Hobby plan) or 30 days (Pro plan)
- Verify backup settings in database dashboard
- Consider exporting backups periodically for long-term storage

## Production Readiness Checklist

### Code & Configuration
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Build succeeds without errors
- [ ] TypeScript errors resolved (or intentionally ignored)

### Stripe Integration
- [ ] Production Stripe keys configured
- [ ] Webhook endpoint configured and tested
- [ ] Test payments working correctly
- [ ] Payment confirmation emails sending

### Email System
- [ ] Gmail credentials configured
- [ ] Contact form emails working
- [ ] Booking confirmation emails working
- [ ] Email templates rendering correctly

### Database
- [ ] Database created and connected
- [ ] Migrations applied successfully
- [ ] Calendar cache populating
- [ ] Bookings being stored correctly

### Domain & SSL
- [ ] Custom domain configured
- [ ] DNS records pointing correctly
- [ ] SSL certificate active
- [ ] HTTPS redirect working

### Testing
- [ ] Home page loads correctly
- [ ] Cabin pages load correctly
- [ ] Calendar displays correctly
- [ ] Booking flow works end-to-end
- [ ] Payment processing works
- [ ] Email confirmations sent
- [ ] Contact form works

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Check for TypeScript errors
- Verify Node.js version compatibility

### Database Connection Issues
- Verify `POSTGRES_URL` is set correctly (or `DATABASE_URL`)
- Check database is running in Vercel dashboard
- Verify migrations were applied
- Check connection limits in database dashboard

### Email Not Sending
- Verify Gmail credentials are correct
- Check Gmail App Password is valid
- Review function logs for email errors
- Verify email addresses are correct

### Stripe Webhook Issues
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Review webhook logs in Stripe dashboard
- Verify webhook events are being received

### Domain/SSL Issues
- Verify DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Check SSL certificate status in Vercel dashboard
- Verify domain is added to Vercel project

## Cost Summary

**Vercel Pro Plan**: $20/month
- Includes: Unlimited deployments, 100 GB bandwidth, team collaboration
- Database: Vercel Postgres Hobby ($0 with Pro plan) or Pro ($20/month)
- **Total Estimated**: $20-40/month depending on database plan

**Free Tier Alternative**:
- Vercel Hobby: $0/month (limited features)
- Vercel Postgres Hobby: $20/month standalone
- **Total**: $20/month (but with limitations)

**Recommendation**: Start with Vercel Pro ($20/month) for full features and included database.

## Success Criteria

Deployment is successful when:
1. ✅ Site is accessible at custom domain
2. ✅ All pages load correctly
3. ✅ Calendar syncs with Hostaway
4. ✅ Booking flow works end-to-end
5. ✅ Payments process successfully
6. ✅ Email confirmations are sent
7. ✅ Database stores bookings correctly
8. ✅ No critical errors in logs
9. ✅ SSL certificate is active
10. ✅ Webhook events are received

## Ongoing Maintenance

### Regular Tasks
1. **Monitor Deployments**: Check Vercel dashboard weekly
2. **Review Logs**: Check function logs for errors
3. **Database Health**: Monitor Postgres dashboard monthly
4. **Update Dependencies**: Run `pnpm update` monthly, test, then deploy
5. **Backup Verification**: Verify backups are working (automatic with Vercel)

### Deployment Workflow
- **Automatic**: Every push to `main` branch triggers deployment
- **Preview Deployments**: Every PR gets a preview URL
- **Manual Rollback**: Available in Vercel dashboard if needed

### Scaling Considerations
- Vercel auto-scales based on traffic
- Monitor usage in dashboard
- Upgrade plan if needed (currently on free/hobby tier)
- Database connections: Vercel Postgres Hobby plan supports up to 60 connections
