# Deploying to Render (Free)

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   cd c:\Users\nilsv\OneDrive\Bureaublad\aistuff\claudecodeproject\chrome-tos-summarizer
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**:
   - Go to https://github.com/new
   - Create a new repository named `chrome-tos-summarizer`
   - Follow the instructions to push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/chrome-tos-summarizer.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Render

1. **Go to Render**: https://render.com
2. **Sign up** (free account)
3. **Connect GitHub**: Click "Connect GitHub" and authorize
4. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Select your `chrome-tos-summarizer` repository
   - Give it a name like `talk-to-your-terms-api`
   - Select the branch (main)
5. **Use render.yaml** (automatic):
   - Render will automatically detect and use `render.yaml`
   - Free plan is selected automatically

## Step 3: Set Environment Variables

1. In the Render dashboard, go to your service
2. Click "Environment"
3. Add these variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (from https://console.anthropic.com)
   - `JWT_SECRET`: Generate a random string using: `openssl rand -hex 32`
   - `NODE_ENV`: `production`

4. Click "Save"

## Step 4: Deploy

Render will automatically:
- Build your backend
- Start the server
- Give you a production URL like: `https://talk-to-your-terms-api.onrender.com`

## Step 5: Update Your Extension

Update your extension's `manifest.json` with the production URL:

```json
"host_permissions": [
  "https://talk-to-your-terms-api.onrender.com/*"
]
```

And update `config.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://talk-to-your-terms-api.onrender.com',
  ENDPOINTS: {
    ...
  }
};
```

## Free Tier Limitations

- ✅ Works great for personal use and moderate traffic
- ⚠️ Spins down after 15 mins of inactivity (may take ~30s to wake up)
- ⚠️ 512 MB RAM, limited monthly hours
- ✅ SQLite database included (perfect for your use case)

## Upgrading Later

If you need more power:
- Render Paid plans start at $7/month
- Or switch to Railway ($5/month) or AWS (pay as you go)

## Troubleshooting

**Build fails?**
- Check the Deploy log in Render dashboard
- Make sure `render.yaml` is in root directory

**API not responding?**
- Check if service is "Live" (green status)
- Allow 30s for free tier to wake up

**Database issues?**
- Free tier resets database on each deploy
- For persistent data, upgrade to Render paid or use PostgreSQL

---

## Summary of Changes Made

✅ Created `render.yaml` - Render deployment configuration
✅ Created `.env.example` - Environment variables template
✅ Created `.gitignore` - Prevents committing secrets
✅ Ready to push to GitHub and deploy!

Next: Push to GitHub and deploy 🚀
