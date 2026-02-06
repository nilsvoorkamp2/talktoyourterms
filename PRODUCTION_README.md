# Talk to your Terms - Production Version

This is the production-ready version with backend authentication.

## 🎯 What Changed?

### ✅ Security Improvements:
- API key stored on backend server (not in browser)
- User authentication with JWT tokens
- Secure password hashing
- Rate limiting
- Usage tracking

### ✅ New Features:
- User accounts (signup/login)
- Usage statistics
- Persistent sessions
- Multi-user support

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```env
ANTHROPIC_API_KEY=your_actual_api_key_here
JWT_SECRET=your_secure_random_secret
```

Initialize database:
```bash
npm run init-db
```

Start server:
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Extension Setup

1. Update `config.js` if your backend URL changes
2. Reload extension at `chrome://extensions/`
3. Create an account or sign in
4. Start analyzing!

## 📁 File Structure

```
chrome-tos-summarizer/
├── backend/               # Backend server
│   ├── server.js         # Main server
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── db.js            # Database layer
│   └── package.json     # Dependencies
│
├── chrome-tos-summarizer-backup/  # Original personal version
│
├── popup.html           # Updated with login/signup
├── popup.js             # Updated for backend auth
├── config.js            # Backend URL configuration
├── manifest.json        # Updated permissions
└── ...other files
```

## 🔐 Security Notes

**Production deployment:**
1. Use HTTPS (not HTTP)
2. Change JWT_SECRET to secure random string
3. Use PostgreSQL instead of SQLite
4. Enable CORS only for your extension ID
5. Set up proper logging and monitoring
6. Add rate limiting per user
7. Implement password reset functionality

## 🌐 Deployment

### Backend Options:
- **Vercel** (easiest, free tier)
- **Railway** (good for Node.js)
- **Heroku** (reliable, paid)
- **Your VPS** (full control)

See `backend/README.md` for deployment details.

### Extension:
- Keep unpacked for development
- Publish to Chrome Web Store for production
- Update `config.js` with production backend URL

## 📊 Features

**User Management:**
- Email/password authentication
- JWT tokens (7-day expiry)
- Session persistence

**Analysis:**
- Same ToS analysis as before
- Q&A functionality
- Usage tracking per user

**Coming Soon:**
- Password reset
- Email verification
- Usage limits/quotas
- Premium tiers
- Team accounts

## 🔄 Reverting to Personal Version

If you need the personal version (without backend):

1. Copy files from `chrome-tos-summarizer-backup/`
2. Replace current files
3. Reload extension

## 🐛 Troubleshooting

**"Connection error":**
- Make sure backend server is running
- Check `config.js` has correct URL
- Verify CORS is configured

**"Token expired":**
- Sign in again
- Tokens expire after 7 days

**Backend not starting:**
- Run `npm install` in backend folder
- Check `.env` file exists
- Verify Node.js is installed

## 💡 Tips

- Backend must be running for extension to work
- Each user needs their own account
- Free tier limits: check your hosting provider
- Monitor API usage in Anthropic dashboard

## 📞 Support

Issues? Check:
1. Backend logs: `npm run dev` output
2. Browser console: Right-click popup → Inspect
3. Extension console: chrome://extensions → Details → Inspect views

Happy analyzing! 🎉
