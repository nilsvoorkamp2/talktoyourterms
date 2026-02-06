# 🚀 Quick Start Guide

## ✅ What's Ready

1. **Backup created**: `chrome-tos-summarizer-backup/` (your original working version)
2. **Backend server**: Full authentication system in `backend/`
3. **Updated extension**: Login/signup UI with backend integration

## 🎯 Get Started in 5 Minutes

### Step 1: Start the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
JWT_SECRET=your-secure-random-string-here
```

Initialize database and start:
```bash
npm run init-db
npm run dev
```

You should see: `🚀 Server running on port 3000`

### Step 2: Reload Extension

1. Go to `chrome://extensions/`
2. Find "Talk to your Terms"
3. Click the reload button 🔄

### Step 3: Create Account

1. Click the extension icon
2. Click "Sign up"
3. Enter email and password (min 8 chars)
4. Click "Create Account"

### Step 4: Test It!

1. Go to any Terms of Service page
2. Click "Analyze Current Page"
3. Ask questions about the terms!

## 🔐 What Changed?

**Before (Personal Use):**
- API key stored in browser ❌
- Anyone can extract it ❌
- Not shareable ❌

**Now (Production Ready):**
- API key on secure server ✅
- User authentication ✅
- Multi-user support ✅
- Usage tracking ✅
- Ready to deploy ✅

## 📁 File Structure

```
chrome-tos-summarizer/
├── backend/                           ← NEW! Backend server
│   ├── server.js                     ← Main server
│   ├── routes/                       ← API endpoints
│   ├── db.js                         ← Database
│   └── package.json
│
├── chrome-tos-summarizer-backup/     ← Your original version (safe!)
│
├── popup.html                         ← Updated: Login/Signup UI
├── popup.js                           ← Updated: Backend integration
├── config.js                          ← NEW! Backend URL config
├── manifest.json                      ← Updated: New permissions
│
└── PRODUCTION_README.md              ← Full documentation
```

## 🌟 Features

**User Management:**
- Email/password registration
- Secure JWT authentication
- 7-day session tokens

**Same Functionality:**
- Analyze Terms of Service
- Ask questions (Q&A)
- PDF/TXT upload
- Multi-language support
- State persistence

**New Capabilities:**
- Usage tracking
- Per-user analytics
- Rate limiting
- Ready for Chrome Web Store

## ⚠️ Important Notes

1. **Backend must be running** for extension to work
2. Each user needs their own account
3. Tokens expire after 7 days (just login again)
4. Personal version backed up in `chrome-tos-summarizer-backup/`

## 🔄 Switch Back to Personal Version

If something doesn't work:

```bash
# Copy backup files back
cp -r chrome-tos-summarizer-backup/* chrome-tos-summarizer/
```

Then reload extension at `chrome://extensions/`

## 🌐 Next Steps (Deploy to Production)

### Deploy Backend:

**Option 1: Vercel (Easiest)**
```bash
npm i -g vercel
cd backend
vercel
```

**Option 2: Railway**
1. Connect GitHub repo
2. Add environment variables
3. Deploy!

### Update Extension:

1. Edit `config.js`:
```javascript
BASE_URL: 'https://your-deployed-backend.com'
```

2. Reload extension

3. Ready to publish to Chrome Web Store!

## 🐛 Troubleshooting

**"Connection error"**
→ Backend not running. Run `npm run dev` in backend folder

**"Token expired"**
→ Login again (tokens last 7 days)

**Can't create account**
→ Check backend console for errors

**Extension won't load**
→ Check browser console (Right-click popup → Inspect)

## 📞 Need Help?

1. Check `PRODUCTION_README.md` for full documentation
2. Check `backend/README.md` for backend setup
3. Look at browser/backend console logs

## 🎉 You're All Set!

Your extension is now production-ready with:
- ✅ Secure backend
- ✅ User authentication
- ✅ Original version backed up
- ✅ Ready to deploy

Start the backend, create an account, and start analyzing! 🚀
