# Talk to your Terms - Backend Server

Production-ready backend server for the Talk to your Terms Chrome extension.

## Features

- ✅ User authentication (JWT)
- ✅ Secure API key storage
- ✅ Rate limiting
- ✅ Usage tracking
- ✅ SQLite database
- ✅ RESTful API

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
ANTHROPIC_API_KEY=your_actual_api_key_here
JWT_SECRET=generate_a_secure_random_string_here
```

**To generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Initialize Database

```bash
npm run init-db
```

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

**Register:**
```
POST /api/auth/register
Body: { "email": "user@example.com", "password": "secure_password" }
```

**Login:**
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "secure_password" }
```

**Verify Token:**
```
GET /api/auth/verify
Headers: { "Authorization": "Bearer <token>" }
```

### Analysis (Requires Authentication)

**Analyze ToS:**
```
POST /api/analysis/analyze
Headers: { "Authorization": "Bearer <token>" }
Body: { "text": "Terms of service text..." }
```

**Ask Question:**
```
POST /api/analysis/ask
Headers: { "Authorization": "Bearer <token>" }
Body: { "question": "Can I cancel anytime?", "context": "ToS text..." }
```

**Get Usage Stats:**
```
GET /api/analysis/usage
Headers: { "Authorization": "Bearer <token>" }
```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard
4. Done!

### Railway

1. Connect your GitHub repo
2. Add environment variables
3. Deploy automatically

### Docker

```bash
docker build -t talk-to-terms-backend .
docker run -p 3000:3000 --env-file .env talk-to-terms-backend
```

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Input validation
- SQL injection protection

## Database Schema

**users:**
- id, email, password_hash, created_at, last_login, is_active

**usage:**
- id, user_id, action_type, tokens_used, created_at

## Development

Run with auto-reload:
```bash
npm run dev
```

## Production Checklist

- [ ] Set secure JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure CORS for your extension ID
- [ ] Set up backups
- [ ] Add logging service
