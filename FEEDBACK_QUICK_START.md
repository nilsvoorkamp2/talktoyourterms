# Feedback Loop System - Quick Start Guide

## What Was Built

A complete feedback collection system to gather training data for improving your ToS analysis AI model. Users rate summaries (1-5 stars) and can provide comments, which are stored for later training or analysis.

## Components

### 1. **Extension UI** (popup.html, popup.js, styles.css)
- ⭐ Star rating component below Q&A section
- 💬 Optional feedback text area
- 📤 "Submit Feedback" button with status messages

### 2. **Backend API** (backend/routes/analysis.js)
- `POST /api/analysis/feedback` - Submit user feedback
- `GET /api/analysis/feedback` - Retrieve feedback (paginated, filterable by rating)
- `GET /api/analysis/feedback/stats` - Get statistics and distribution

### 3. **Database Schema** (backend/init-db.js)
- New `feedback` table stores:
  - Original ToS text
  - Generated summary
  - User rating (1-5)
  - Optional feedback comments
  - Corrections/edits by user
  - Model used
  - Source (web or upload)
  - Timestamps

### 4. **Admin Dashboard** (backend/admin-dashboard.html)
- View at: `http://your-server/dashboard`
- Shows statistics and charts
- List recent feedback with filter options
- Real-time auto-refresh (every 30 seconds)

### 5. **Data Export Script** (backend/export-feedback.js)
- Export feedback in multiple formats:
  - JSON (generic)
  - JSONL (for OpenAI fine-tuning)
  - CSV (for spreadsheet analysis)
  - Training Pairs (for model fine-tuning)

## Deployment Steps

### Step 1: Initialize Database

Run the database initialization script to create the feedback table:

```bash
cd backend
node init-db.js
```

You should see:
```
✓ Feedback table created
✓ Feedback index created
✓ Feedback rating index created
```

### Step 2: Restart Backend

```bash
# If running locally
npm start

# If on Render.com
# Push changes - it will auto-deploy
git add .
git commit -m "Add feedback collection system"
git push
```

### Step 3: Reload Extension

1. Go to `chrome://extensions/`
2. Find "Talk to your Terms"
3. Click the refresh/reload icon
4. (Or disable and re-enable if needed)

### Step 4: Test It

1. Go to any Terms of Service page
2. Click extension icon → "Analyze Terms of Service"
3. Wait for summary
4. You should now see the feedback section with ⭐ stars
5. Click a star rating (try 5 for excellent!)
6. Optionally add a comment like "Perfect summary!"
7. Click "Submit Feedback"
8. You should see confirmation: "Thank you! Your feedback helps improve the AI model."

### Step 5: View Dashboard

Open your browser and go to:
```
http://localhost:3000/dashboard  (local)
https://your-render-domain/dashboard  (production)
```

You should see:
- Stats cards (Total Feedback, Average Rating, etc.)
- Rating distribution chart
- Recent feedback list with filtering options

## How It Works

### For Users

1. **Rate the Summary**: Choose 1-5 stars based on quality
2. **Add Comments** (optional): 
   - "Missing information about data retention"
   - "Summary was too long"
   - "Unclear wording in clause #3"
3. **Submit**: One click, instant confirmation

### For You (Training Data Collection)

The system tracks:
- **What works**: High-rated summaries from certain websites
- **What doesn't**: Low-rated summaries reveal problem areas
- **Patterns**: Common feedback themes show improvement areas
- **Coverage**: Which sites/industries need more work

## Using the Data

### View Statistics

Access real-time stats at `/api/analysis/feedback/stats`:
```json
{
  "average_rating": 4.2,
  "total_feedback": 150,
  "rating_distribution": [
    { "rating": 5, "count": 60, "percentage": 40.0 },
    { "rating": 4, "count": 50, "percentage": 33.3 },
    ...
  ],
  "by_source": [
    { "source": "web", "count": 120 },
    { "source": "upload", "count": 30 }
  ]
}
```

### Export for Analysis

```bash
# Export all feedback as JSON
node export-feedback.js --format json --output feedback.json

# Export only 5-star feedback for training (clean data)
node export-feedback.js --format json --rating 5 --output excellent.json

# Export for OpenAI fine-tuning format
node export-feedback.js --format jsonl --rating 4 --output training.jsonl

# Export as CSV for spreadsheet analysis
node export-feedback.js --format csv --output feedback.csv
```

### Analyze Patterns

```python
import json

# Load feedback
with open('feedback.json') as f:
    data = json.load(f)

# Analyze by rating
ratings = {}
for item in data['training_data']:
    r = item['rating']
    if r not in ratings:
        ratings[r] = []
    ratings[r].append(item)

# Find common issues in low-rated items
print("Common issues in 1-2 star ratings:")
for item in ratings.get(1, []) + ratings.get(2, []):
    if item['user_feedback']:
        print(f"  - {item['user_feedback']}")
```

## Database Queries

### Get Average Rating by Website

```sql
SELECT 
  tos_url,
  COUNT(*) as count,
  ROUND(AVG(rating), 2) as avg_rating
FROM feedback
GROUP BY tos_url
ORDER BY avg_rating ASC
LIMIT 20;
```

### Find Problematic Websites

```sql
SELECT 
  tos_url,
  rating,
  user_feedback
FROM feedback
WHERE rating <= 2
  AND user_feedback IS NOT NULL
ORDER BY created_at DESC
LIMIT 50;
```

### Export Training Data

```sql
.mode csv
.output training_data.csv
SELECT 
  tos_text as input,
  original_summary as output,
  rating,
  user_feedback
FROM feedback
WHERE rating >= 4
ORDER BY rating DESC;
```

## Next Steps: Using for Model Training

Once you have 200-500 good feedback examples:

### Option 1: Fine-tune Claude (Easiest)
Use Anthropic's batch fine-tuning API with your high-rated feedback

### Option 2: Fine-tune OpenAI
Use OpenAI's fine-tuning API with your feedback as training data

### Option 3: Train Custom Model
Use your feedback to train a smaller, faster, specialized model:
- Mistral 7B + LoRA fine-tuning
- Llama 2 13B + flash-attention
- Deploy locally or on Render

### Option 4: RAG (Quickest Improvement)
Add vector database layer to retrieve similar past analyses:
- When new analysis comes in, find 3-5 similar high-rated past analyses
- Send examples to Claude as "few-shot" prompts
- Claude produces better analysis with examples

## Monitoring

### Daily
- Check dashboard for any low-rated feedbacks
- Fix obvious issues in prompt/system

### Weekly  
- Export and analyze patterns
- Identify top problem areas
- Plan improvements

### Monthly
- Collect statistics
- Decide if enough data for training
- Fine-tune model if benchmarks met

## Privacy & Security

- All feedback stays in your database
- Users can provide anonymous ratings (no user tracking required)  
- ToS text stored for context (needed for training)
- API endpoints have rate limiting
- Dashboard can be protected with authentication (add later)

## Files Modified/Added

✅ **Modified:**
- `backend/init-db.js` - Added feedback table schema
- `backend/server.js` - Added dashboard route and static serving
- `backend/routes/analysis.js` - Added feedback API endpoints
- `popup.html` - Added feedback UI section
- `popup.js` - Added feedback handlers and event listeners
- `styles.css` - Added feedback styling

✅ **Created:**
- `backend/admin-dashboard.html` - Web dashboard for viewing feedback
- `backend/export-feedback.js` - Data export script for analysis
- `FEEDBACK_SYSTEM.md` - Comprehensive documentation
- `FEEDBACK_QUICK_START.md` - This file

## Troubleshooting

### Feedback not saving?
1. Check browser console for errors
2. Verify API endpoint in config.js matches server
3. Check server logs for 500 errors
4. Ensure database table was created: `node init-db.js`

### Dashboard not loading?
1. Verify server is running on correct port
2. Check that backend/admin-dashboard.html exists
3. Database must have feedback table

### Export script failing?
1. Ensure sqlite3 is installed: `npm install sqlite3`
2. Check DATABASE_PATH in .env
3. Verify database.db file exists

## Questions?

Refer to:
- [FEEDBACK_SYSTEM.md](FEEDBACK_SYSTEM.md) - Detailed documentation
- API responses for exact data structure
- Dashboard UI for real-time statistics

---

**You're all set!** 🎉 Start collecting training data by rating summaries. After 2-3 weeks of usage, you'll have enough data to analyze patterns and potentially fine-tune a specialized model.
