const sqlite3 = require('sqlite3').verbose();

// Open the SQLite database file, or create it if it doesn't exist
const db = new sqlite3.Database('./test.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,  -- UUID
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL 
      );
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists.');
      }
    });

    // Create tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,  -- UUID for tasks
        userid TEXT NOT NULL,  -- Foreign key to the users table
        name TEXT NOT NULL,
        brief TEXT NOT NULL,
        state TEXT NOT NULL,
        FOREIGN KEY (userid) REFERENCES users(id)  -- Foreign key constraint
      )
    `, (err) => {
      if (err) {
        console.error('Error creating tasks table:', err.message);
      } else {
        console.log('Tasks table created or already exists.');
      }
    });
  }
});

module.exports = db;
