#!/usr/bin/env node

/**
 * Feedback Data Export Script
 * 
 * Exports collected feedback data in formats suitable for model training:
 * - JSON (for model fine-tuning)
 * - CSV (for analysis in Excel/Python)
 * - JSONL (for OpenAI fine-tuning format)
 * 
 * Usage:
 *   node export-feedback.js --format json --rating 4 --limit 1000
 *   node export-feedback.js --format csv --output feedback.csv
 *   node export-feedback.js --format jsonl --rating 5 > training_data.jsonl
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './database.db';

class FeedbackExporter {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  /**
   * Get feedback from database
   */
  async getFeedback(minRating = 1, limit = 10000) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id,
          user_id,
          tos_url,
          tos_text,
          original_summary,
          rating,
          user_feedback,
          user_corrections,
          model_used,
          source,
          created_at
        FROM feedback
        WHERE rating >= ?
        ORDER BY created_at DESC
        LIMIT ?
      `;

      this.db.all(query, [minRating, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Export as JSON
   */
  exportJSON(feedback) {
    return JSON.stringify({
      export_date: new Date().toISOString(),
      total_items: feedback.length,
      average_rating: (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2),
      training_data: feedback.map(f => ({
        id: f.id,
        input: f.tos_text,
        output: f.original_summary,
        rating: f.rating,
        user_feedback: f.user_feedback,
        user_corrections: f.user_corrections,
        model_used: f.model_used,
        source: f.source,
        created_at: f.created_at,
        tos_url: f.tos_url
      }))
    }, null, 2);
  }

  /**
   * Export as JSONL (one JSON object per line)
   * Format for OpenAI fine-tuning API
   */
  exportJSONL(feedback) {
    return feedback.map(f => JSON.stringify({
      prompt: f.tos_text.substring(0, 3000) + '\n\nSummarize this Terms of Service:',
      completion: f.original_summary
    })).join('\n');
  }

  /**
   * Export as CSV
   */
  exportCSV(feedback) {
    const headers = [
      'ID',
      'Rating',
      'Model',
      'Source',
      'Date',
      'URL',
      'ToS Length',
      'Summary Length',
      'User Feedback'
    ];

    const rows = feedback.map(f => [
      f.id,
      f.rating,
      f.model_used,
      f.source,
      f.created_at.split('T')[0],
      f.tos_url || '',
      f.tos_text.length,
      f.original_summary.length,
      `"${(f.user_feedback || '').replace(/"/g, '""')}"` // Escape quotes
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Export as Training Pairs (for fine-tuning)
   */
  exportTrainingPairs(feedback, minRating = 4) {
    const pairs = feedback
      .filter(f => f.rating >= minRating)
      .map(f => ({
        input: f.tos_text,
        output: f.original_summary,
        rating: f.rating,
        quality_score: this.calculateQualityScore(f)
      }));

    return JSON.stringify({
      metadata: {
        total_pairs: pairs.length,
        min_rating: minRating,
        average_rating: (pairs.reduce((sum, p) => sum + p.rating, 0) / pairs.length).toFixed(2),
        export_date: new Date().toISOString()
      },
      training_pairs: pairs
    }, null, 2);
  }

  /**
   * Calculate quality score based on rating and feedback
   */
  calculateQualityScore(feedback) {
    let score = feedback.rating / 5; // Base score from rating

    // Bonus points for detailed feedback
    if (feedback.user_feedback && feedback.user_feedback.length > 10) {
      score += 0.1;
    }

    // Penalty for corrections
    if (feedback.user_corrections) {
      score -= 0.05;
    }

    return Math.min(1, Math.max(0, score)); // Clamp between 0-1
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close(err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    format: 'json',
    minRating: 1,
    limit: 10000,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format') config.format = args[++i];
    if (args[i] === '--rating') config.minRating = parseInt(args[++i]);
    if (args[i] === '--limit') config.limit = parseInt(args[++i]);
    if (args[i] === '--output') config.output = args[++i];
  }

  return config;
}

/**
 * Main execution
 */
async function main() {
  const config = parseArgs();
  const exporter = new FeedbackExporter();

  try {
    console.error(`📊 Exporting feedback data...`);
    console.error(`   Format: ${config.format}`);
    console.error(`   Min Rating: ${config.minRating}`);
    console.error(`   Limit: ${config.limit}`);

    const feedback = await exporter.getFeedback(config.minRating, config.limit);
    console.error(`✓ Retrieved ${feedback.length} feedback items\n`);

    let output;
    switch (config.format) {
      case 'json':
        output = exporter.exportJSON(feedback);
        break;
      case 'jsonl':
        output = exporter.exportJSONL(feedback);
        break;
      case 'csv':
        output = exporter.exportCSV(feedback);
        break;
      case 'pairs':
        output = exporter.exportTrainingPairs(feedback, config.minRating);
        break;
      default:
        throw new Error(`Unknown format: ${config.format}`);
    }

    if (config.output) {
      fs.writeFileSync(config.output, output);
      console.error(`✓ Exported to: ${config.output}`);
    } else {
      console.log(output);
    }

    await exporter.close();
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

main();
