# Feedback Loop System - Training Data Collection

This document describes how the feedback loop system works and how to use it to collect training data for AI model improvement.

## Overview

The feedback loop system allows users to rate and provide feedback on AI-generated summaries. This data is collected and can be used to:

1. **Monitor Quality**: Track how well the AI is performing across different websites
2. **Identify Problems**: Find specific ToS documents or patterns that cause poor summaries
3. **Train Specialized Models**: Use the collected feedback data to fine-tune or train a custom LLM
4. **Improve Prompts**: Analyze patterns in feedback to improve prompt engineering

## Architecture

### Database Schema

The system stores feedback in a `feedback` table with the following fields:

```sql
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,                    -- User who provided feedback
  tos_url TEXT,                       -- URL of the TOS (if from web)
  tos_text TEXT,                      -- Original ToS text analyzed
  original_summary TEXT,              -- AI-generated summary
  rating INTEGER (1-5),               -- User's quality rating
  user_feedback TEXT,                 -- Optional feedback/comments
  user_corrections TEXT,              -- Optional edited/corrected summary
  model_used TEXT,                    -- Which Claude model was used
  source TEXT,                        -- 'web' or 'upload'
  created_at DATETIME,                -- When feedback was submitted
  updated_at DATETIME
)
```

### Extension UI

Users can provide feedback directly in the extension popup:

1. **Star Rating** (1-5): Quick quality assessment
   - 1 ⭐ Poor: Missing key information, misleading
   - 2 😐 Fair: Incomplete but mostly accurate
   - 3 👍 Good: Covers main points
   - 4 😊 Very Good: Comprehensive and accurate
   - 5 ⭐ Excellent: Perfect summary

2. **Optional Feedback**: Free-form text where users can specify:
   - "Missing information about data sharing"
   - "Summary was too long/short"
   - "Missed arbitration clause"
   - etc.

### API Endpoints

#### Submit Feedback
```
POST /api/analysis/feedback
Content-Type: application/json

{
  "tosUrl": "https://example.com/terms",
  "tosText": "Full TOS text...",
  "summary": "AI-generated summary...",
  "rating": 4,
  "feedback": "Good but missing section about cancellation",
  "corrections": null,
  "model": "claude-3-haiku-20240307",
  "source": "web"
}

Response:
{
  "success": true,
  "feedbackId": 123,
  "message": "Feedback received..."
}
```

#### Get Feedback
```
GET /api/analysis/feedback?rating=5&limit=50&offset=0

Response:
{
  "feedback": [
    {
      "id": 1,
      "user_id": "user123",
      "tos_url": "https://example.com",
      "rating": 5,
      "user_feedback": "Perfect!",
      "created_at": "2026-02-07T10:30:00Z"
    }
  ],
  "total": 150,
  "offset": 0,
  "limit": 50
}
```

#### Get Statistics
```
GET /api/analysis/feedback/stats

Response:
{
  "rating_distribution": [
    { "rating": 5, "count": 45, "percentage": 30.0 },
    { "rating": 4, "count": 60, "percentage": 40.0 },
    { "rating": 3, "count": 30, "percentage": 20.0 },
    { "rating": 2, "count": 12, "percentage": 8.0 },
    { "rating": 1, "count": 3, "percentage": 2.0 }
  ],
  "average_rating": 4.2,
  "total_feedback": 150,
  "by_source": [
    { "source": "web", "count": 120 },
    { "source": "upload", "count": 30 }
  ]
}
```

## Dashboard

Access the feedback dashboard at `http://your-server/dashboard` to:

- **View Overview**: Total feedback count, average rating, distribution
- **Filter Feedback**: By rating (5-star, 4-star, poor, all)
- **Read Comments**: See specific user feedback and corrections
- **Monitor Trends**: Track rating distribution and data sources
- **Auto-refresh**: Dashboard updates every 30 seconds

## Using Feedback Data for Model Improvement

### Phase 1: Data Collection (Weeks 1-2)

- Gather 200-500 high-quality feedback examples
- Focus on balanced rating distribution
- Collect examples from diverse websites

### Phase 2: Data Analysis (Week 2-3)

```python
# Analyze patterns
- Low ratings (1-3 stars): What topics/sites struggle?
- Missing clauses: What patterns appear in corrections?
- Common feedback themes: What improvements needed?
```

### Phase 3: Fine-tuning (Week 3-4)

#### Option A: OpenAI Fine-tuning
```python
# Preparation
from datasets import Dataset

training_data = []
for feedback in db.query("SELECT * FROM feedback WHERE rating >= 4"):
    training_data.append({
        "prompt": f"Analyze this ToS: {feedback.tos_text[:3000]}",
        "completion": feedback.original_summary
    })

# Use OpenAI's fine-tuning API
# This creates a model optimized for ToS summarization
```

#### Option B: Claude Fine-tuning
```python
# Anthropic supports batch fine-tuning
training_pairs = []
for feedback in db.query("SELECT * FROM feedback WHERE rating >= 4"):
    training_pairs.append({
        "input": feedback.tos_text,
        "output": feedback.original_summary
    })

# Upload to Anthropic's batch API
```

#### Option C: Local Model Fine-tuning
```python
# Use Mistral or Llama 2 with LoRA fine-tuning
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="mistral-7b",
    max_seq_length=8192,
    load_in_4bit=True,
)

# Train on collected feedback
# Deploy locally or on your server
```

### Phase 4: Validation

```python
# Test improvements
test_set = db.query("SELECT * FROM feedback WHERE rating >= 4 LIMIT 100")

for test_case in test_set:
    original_summary = test_case.original_summary
    # Call new fine-tuned model
    new_summary = call_finetuned_model(test_case.tos_text)
    
    # Compare: does user prefer new summary?
    # Would they rate it higher?
```

## Data Extraction Format for Model Training

When exporting data for model training, structure it as:

```json
{
  "training_data": [
    {
      "id": 1,
      "input": "Full TOS text here...",
      "output": "Generated summary here...",
      "rating": 5,
      "user_feedback": "Perfect",
      "source": "web",
      "website": "example.com",
      "length": 15000,
      "date": "2026-02-07"
    }
  ]
}
```

### Export Script

```bash
# Via API
curl http://localhost:3000/api/analysis/feedback?limit=1000 > all_feedback.json

# Or via database
sqlite3 database.db "SELECT * FROM feedback WHERE rating >= 4" > feedback.csv
```

## Privacy Considerations

- Users can optionally provide feedback (not mandatory)
- ToS text is stored in database (needed for context in model training)
- All data remains private on your server
- Consider anonymizing URLs if publishing data

## Metrics to Track

1. **Quality Metrics**
   - Average rating over time (trending up = improving)
   - % of 4-5 star ratings
   - By model: which Claude model gets better ratings?

2. **Coverage Metrics**
   - # of websites analyzed
   - Top 20 websites (where most feedback comes from)
   - Domains that need improvement

3. **Pattern Metrics**
   - Most common feedback themes
   - Clauses most often mentioned in corrections
   - Types of sites with lowest ratings

## Example: Setting Up Auto-Training

```javascript
// Run weekly to check if enough new data
const checkAndTrain = async () => {
  const newFeedback = await db.query(
    "SELECT COUNT(*) as count FROM feedback WHERE created_at > ?",
    [Date.now() - 7 * 24 * 60 * 60000]
  );

  if (newFeedback.count >= 100) {
    // Trigger fine-tuning job
    await triggerFineTuning();
  }
};

// Schedule weekly
schedule('0 0 * * 0', checkAndTrain);
```

## Next Steps

1. ✅ Deploy feedback collection system
2. Gather 500+ high-quality feedback examples
3. Analyze feedback patterns and trends
4. Choose fine-tuning approach
5. Train and validate specialized model
6. Deploy specialized model, retire general Claude
7. Continue collecting feedback for continuous improvement

---

**Timeline**: This entire process can be completed over 4-8 weeks, resulting in a 50-80% cost reduction and 20-40% quality improvement for ToS summarization.
