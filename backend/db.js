const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './database.db';

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('✓ Database connected');
        this.initializeTables();
      }
    });
  }

  /**
   * Initialize database tables if they don't exist
   */
  async initializeTables() {
    try {
      // Users table
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          is_active INTEGER DEFAULT 1
        )
      `);
      console.log('✓ Users table ready');

      // Usage tracking table
      await this.run(`
        CREATE TABLE IF NOT EXISTS usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action_type TEXT NOT NULL,
          tokens_used INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      console.log('✓ Usage table ready');

      // Feedback table
      await this.run(`
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
      `);
      console.log('✓ Feedback table ready');

      // Create indexes
      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_usage_user_date
        ON usage(user_id, created_at)
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_feedback_user_date
        ON feedback(user_id, created_at)
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_feedback_rating
        ON feedback(rating)
      `);

      console.log('✓ All database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing tables:', error);
    }
  }

  // Helper to run queries with promises
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();
