# Environment Variables Template for Vercel

Copy these variable names to **Vercel Dashboard → Settings → Environment Variables**.

**Important**: Set variables for **Production**, **Preview**, and **Development** environments separately.

## Required Environment Variables

### Database

```
POSTGRES_URL=postgres://user:password@host:port/database
```

**How to get**: 
1. Go to Vercel Dashboard → Storage → Your Database
2. Click on **.env.local** tab
3. Copy the `POSTGRES_URL` value

**Note**: The code also supports `DATABASE_URL` if you prefer that name.

---

### Stripe (Production)

```
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**How to get**:
1. Go to Stripe Dashboard → Developers → API keys
2. Copy **Secret key** (starts with `sk_live_`)
3. Copy **Publishable key** (starts with `pk_live_`)
4. For `STRIPE_WEBHOOK_SECRET`: Create webhook first (see deployment guide), then copy signing secret

**For Preview/Development environments**: Use test keys (`sk_test_`, `pk_test_`)

---

### Hostaway API

**Option 1: OAuth Credentials (Recommended)**
```
HOSTAWAY_CLIENT_ID=your_hostaway_client_id
HOSTAWAY_CLIENT_SECRET=your_hostaway_client_secret
```

**Option 2: Pre-generated Access Token (Alternative)**
```
HOSTAWAY_ACCESS_TOKEN=your_hostaway_access_token
```

**How to get**: From your Hostaway account settings or API documentation.

---

### Email (Gmail)

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

**How to get**: 
1. See `GMAIL_SETUP.md` for detailed instructions
2. Enable 2-Step Verification on your Google Account
3. Generate App Password from Google Account → Security → App passwords
4. Copy the 16-character password

---

### Node Environment

```
NODE_ENV=production
```

Set this to `production` for Production environment only.

---

## Environment-Specific Configuration

### Production
- Use **production** Stripe keys (`sk_live_`, `pk_live_`)
- Use **production** Hostaway credentials
- Set `NODE_ENV=production`

### Preview
- Use **test** Stripe keys (`sk_test_`, `pk_test_`)
- Use **production** Hostaway credentials (same as Production)
- `NODE_ENV` can be omitted or set to `development`

### Development
- Use **test** Stripe keys (`sk_test_`, `pk_test_`)
- Use **production** Hostaway credentials (same as Production)
- `NODE_ENV` can be omitted or set to `development`

---

## Security Notes

1. **Mark sensitive variables as "Encrypted"** in Vercel (they are by default)
2. **Never commit** actual values to git
3. **Use different Stripe keys** for Production vs Preview/Development
4. **Rotate credentials** periodically for security

---

## Verification Checklist

After setting all variables:

- [ ] `POSTGRES_URL` set for all environments
- [ ] `STRIPE_SECRET_KEY` set (production for Production, test for others)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set (production for Production, test for others)
- [ ] `HOSTAWAY_CLIENT_ID` set for all environments
- [ ] `HOSTAWAY_CLIENT_SECRET` set for all environments
- [ ] `GMAIL_USER` set for all environments
- [ ] `GMAIL_APP_PASSWORD` set for all environments
- [ ] `NODE_ENV=production` set for Production only
- [ ] `STRIPE_WEBHOOK_SECRET` set (after webhook creation)
- [ ] All variables marked as "Encrypted" (default)

---

## Troubleshooting

**Variable not working?**
- Check variable name matches exactly (case-sensitive)
- Verify variable is set for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check Vercel function logs for errors

**Database connection issues?**
- Verify `POSTGRES_URL` is correct
- Check database is running in Vercel dashboard
- Ensure database migrations are applied

**Stripe not working?**
- Verify keys are correct (production vs test)
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` has `NEXT_PUBLIC_` prefix
- Ensure webhook secret matches Stripe dashboard
