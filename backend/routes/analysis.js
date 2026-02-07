const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { authenticateAnonymous } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Allow both authenticated and anonymous users
router.use(authenticateAnonymous);

// Analyze Terms of Service
router.post('/analyze', async (req, res) => {
  try {
    const { text, model } = req.body;
    const userId = req.user.userId || req.user.sessionId;
    const selectedModel = model || 'claude-3-haiku-20240307';

    if (!text || text.length < 100) {
      return res.status(400).json({ error: 'Text too short to analyze' });
    }

    // Truncate if too long
    const truncatedText = text.length > 100000 ? text.substring(0, 100000) : text;

    try {
      // Call Claude API with the selected model
      const message = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analyze the following Terms of Service document and provide a clear, comprehensive summary in English.

Your summary should cover:
- Key rights and obligations of users
- Important limitations or restrictions
- Privacy and data usage practices
- Cancellation or termination policies
- Any concerning or unusual terms
- What users are agreeing to

Make the summary conversational and easy to understand. Focus on what users need to know before agreeing to these terms.

Terms of Service:
${truncatedText}`
        }]
      });

      const summary = message.content[0].text;

      // Track usage
      await db.run(
        'INSERT INTO usage (user_id, action_type, tokens_used) VALUES (?, ?, ?)',
        [userId, 'analyze', message.usage.input_tokens + message.usage.output_tokens]
      );

      res.json({ summary });
    } catch (modelError) {
      // If model fails, provide helpful error message
      if (modelError.status === 404 && selectedModel !== 'claude-3-haiku-20240307') {
        return res.status(400).json({
          error: `Model "${selectedModel}" is not available with your current API access level. This typically happens when your Anthropic API tier doesn't support this model yet. Please try "Claude 3 Haiku" which works with all API tiers, or upgrade your Anthropic plan to access premium models.`,
          suggestion: 'claude-3-haiku-20240307',
          fallbackAvailable: true
        });
      }
      throw modelError;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed: ' + error.message });
  }
});

// Ask question about ToS
router.post('/ask', async (req, res) => {
  try {
    const { question, context, model } = req.body;
    const userId = req.user.userId || req.user.sessionId;
    const selectedModel = model || 'claude-3-haiku-20240307';

    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context required' });
    }

    // Truncate context if too long
    const truncatedContext = context.length > 50000
      ? context.substring(0, 50000) + '\n\n[Context truncated...]'
      : context;

    try {
      // Call Claude API with the selected model
      const message = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a helpful assistant analyzing Terms of Service. Answer the following question based on the provided ToS document.

Question: ${question}

Terms of Service Context:
${truncatedContext}

Provide a clear, concise answer based only on the information in the ToS. If the answer isn't found in the ToS, say so.`
        }]
      });

      const answer = message.content[0].text;

      // Track usage
      await db.run(
        'INSERT INTO usage (user_id, action_type, tokens_used) VALUES (?, ?, ?)',
        [userId, 'ask', message.usage.input_tokens + message.usage.output_tokens]
      );

      res.json({ answer });
    } catch (modelError) {
      // If model fails, provide helpful error message
      if (modelError.status === 404 && selectedModel !== 'claude-3-haiku-20240307') {
        return res.status(400).json({
          error: `Model "${selectedModel}" is not available with your current API access level. This typically happens when your Anthropic API tier doesn't support this model yet. Please try "Claude 3 Haiku" which works with all API tiers, or upgrade your Anthropic plan to access premium models.`,
          suggestion: 'claude-3-haiku-20240307',
          fallbackAvailable: true
        });
      }
      throw modelError;
    }
  } catch (error) {
    console.error('Question error:', error);
    res.status(500).json({ error: 'Failed to answer question: ' + error.message });
  }
});

// Get usage stats
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user.userId || req.user.sessionId;

    const stats = await db.get(`
      SELECT
        COUNT(*) as total_requests,
        SUM(tokens_used) as total_tokens,
        COUNT(CASE WHEN action_type = 'analyze' THEN 1 END) as analyses,
        COUNT(CASE WHEN action_type = 'ask' THEN 1 END) as questions
      FROM usage
      WHERE user_id = ?
    `, [userId]);

    res.json(stats);
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

// Store feedback for training data collection
router.post('/feedback', async (req, res) => {
  try {
    const { tosUrl, tosText, summary, rating, feedback, corrections, model, source } = req.body;
    const userId = req.user.userId || req.user.sessionId;

    if (!tosText || !summary || !rating) {
      return res.status(400).json({ error: 'tosText, summary, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Store feedback in database
    const result = await db.run(
      `INSERT INTO feedback (user_id, tos_url, tos_text, original_summary, rating, user_feedback, user_corrections, model_used, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        tosUrl || null,
        tosText,
        summary,
        rating,
        feedback || null,
        corrections || null,
        model || 'claude-3-haiku-20240307',
        source || 'web'
      ]
    );

    res.json({
      success: true,
      feedbackId: result.id,
      message: 'Feedback received. Thank you for helping improve the model!'
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to save feedback: ' + error.message });
  }
});

// Get feedback for analysis (admin endpoint)
router.get('/feedback', async (req, res) => {
  try {
    const userId = req.user.userId || req.user.sessionId;
    
    // Check if user is admin (optional - you can add admin table later)
    const { rating, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];

    if (rating) {
      query += ' AND rating = ?';
      params.push(parseInt(rating));
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const feedbackData = await db.all(query, params);
    
    // Get total count
    const countResult = await db.get(
      'SELECT COUNT(*) as total FROM feedback' + (rating ? ' WHERE rating = ?' : ''),
      rating ? [parseInt(rating)] : []
    );

    res.json({
      feedback: feedbackData,
      total: countResult.total,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Feedback retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback: ' + error.message });
  }
});

// Get feedback statistics
router.get('/feedback/stats', async (req, res) => {
  try {
    // Get rating distribution
    const stats = await db.all(`
      SELECT 
        rating,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM feedback), 2) as percentage
      FROM feedback
      GROUP BY rating
      ORDER BY rating DESC
    `);

    // Get average rating
    const avgResult = await db.get(`
      SELECT 
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(*) as total_feedback
      FROM feedback
    `);

    // Get feedback by source
    const sourceStats = await db.all(`
      SELECT 
        source,
        COUNT(*) as count
      FROM feedback
      GROUP BY source
    `);

    res.json({
      rating_distribution: stats,
      average_rating: avgResult.average_rating || 0,
      total_feedback: avgResult.total_feedback || 0,
      by_source: sourceStats
    });
  } catch (error) {
    console.error('Feedback stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics: ' + error.message });
  }
});

module.exports = router;
