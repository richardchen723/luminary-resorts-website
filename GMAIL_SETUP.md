# Gmail Setup Instructions

Follow these steps to configure Gmail for sending contact form emails:

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Click on it and follow the prompts to enable 2-Step Verification
   - You'll need to verify your phone number
   - This is required to create an App Password

## Step 2: Generate an App Password

1. While still in your Google Account Security settings
2. Look for **App passwords** (you may need to search for it)
   - Or go directly to: https://myaccount.google.com/apppasswords
3. You might be asked to sign in again
4. Under "Select app", choose **Mail**
5. Under "Select device", choose **Other (Custom name)**
6. Type "Luminary Resorts Website" or any name you prefer
7. Click **Generate**
8. **Copy the 16-character password** that appears (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important**: You can only see this password once! Copy it immediately.

## Step 3: Add to Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Important Notes:**
- Replace `your-email@gmail.com` with the Gmail address you used to create the App Password
- Replace `abcd efgh ijkl mnop` with the actual App Password you generated (you can include or remove spaces - both work)
- Never commit `.env.local` to git (it should already be in `.gitignore`)

## Step 4: Restart Your Development Server

After adding the environment variables:
1. Stop your development server (Ctrl+C)
2. Start it again: `pnpm dev`
3. The contact form should now send emails!

## Testing

1. Go to the Contact page on your website
2. Fill out the contact form
3. Submit it
4. Check both email inboxes:
   - lydia@luminaryresorts.com
   - usman@luminaryresorts.com

Both should receive the contact form submission.

## Troubleshooting

**Error: "Invalid login"**
- Make sure you're using the App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the App Password was copied correctly (no extra spaces)

**Error: "Email service not configured"**
- Make sure `.env.local` exists in the project root
- Verify the variable names are exactly: `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- Restart your development server after adding environment variables

**Emails not arriving**
- Check spam/junk folders
- Verify both recipient email addresses are correct
- Check server logs for any error messages
