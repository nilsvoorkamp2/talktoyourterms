const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './database.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active INTEGER DEFAULT 1
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('✓ Users table created');
  });

  // Usage tracking table
  db.run(`
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      tokens_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating usage table:', err);
    else console.log('✓ Usage table created');
  });

  // Create index for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_usage_user_date
    ON usage(user_id, created_at)
  `, (err) => {
    if (err) console.error('Error creating index:', err);
    else console.log('✓ Index created');
  });

  // Feedback table for training data collection
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tos_url TEXT,
      tos_text TEXT NOT NULL,
      original_summary TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      user_feedback TEXT,
      user_corrections TEXT,
      model_used TEXT DEFAULT 'claude-3-haiku-20240307',
      source TEXT DEFAULT 'web',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating feedback table:', err);
    else console.log('✓ Feedback table created');
  });

  // Create index for feedback queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_feedback_user_date
    ON feedback(user_id, created_at)
  `, (err) => {
    if (err) console.error('Error creating feedback index:', err);
    else console.log('✓ Feedback index created');
  });

  // Create index for finding feedback by rating
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_feedback_rating
    ON feedback(rating)
  `, (err) => {
    if (err) console.error('Error creating feedback rating index:', err);
    else console.log('✓ Feedback rating index created');
  });
});

db.close((err) => {
  if (err) console.error('Error closing database:', err);
  else console.log('✓ Database initialized successfully');
});
