const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize database with required tables and mock instructors
function initializeDatabase() {
    db.serialize(async () => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                role TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                AMnumber TEXT
            )
        `, async (err) => {
            if (err) {
                console.error('[USER-MNGMNT] ❌ Error creating users table:', err.message);
            } else {
                console.log('[USER-MNGMNT] ✅ Users table ready');

                // Hash passwords before inserting
                const hash1 = await bcrypt.hash('password', 10);
                const hash2 = await bcrypt.hash('password', 10);
                const hash3 = await bcrypt.hash('password', 10);

                db.run(
                    `INSERT OR IGNORE INTO users (username, role, email, password, AMnumber) VALUES (?, ?, ?, ?, ?)`,
                    ['teacher1', 'instructor', 'teacher1@mail.com', hash1, ''],
                    (err) => {
                        if (err) console.error('[USER-MNGMNT] ❌ Instructor teacher1:', err.message);
                        else console.log('[USER-MNGMNT] ✅ Instructor teacher1 added');
                    }
                );
                db.run(
                    `INSERT OR IGNORE INTO users (username, role, email, password, AMnumber) VALUES (?, ?, ?, ?, ?)`,
                    ['teacher2', 'instructor', 'teacher2@mail.com', hash2, ''],
                    (err) => {
                        if (err) console.error('[USER-MNGMNT] ❌ Instructor teacher2:', err.message);
                        else console.log('[USER-MNGMNT] ✅ Instructor teacher2 added');
                    }
                );
                db.run(
                    `INSERT OR IGNORE INTO users (username, role, email, password, AMnumber) VALUES (?, ?, ?, ?, ?)`,
                    ['teacher3', 'instructor', 'teacher3@mail.com', hash3, ''],
                    (err) => {
                        if (err) console.error('[USER-MNGMNT] ❌ Instructor teacher3:', err.message);
                        else console.log('[USER-MNGMNT] ✅ Instructor teacher3 added');
                    }
                );
            }
        });
    });
}

// Connect to SQLite database
const dbPath = path.join(dataDir, 'user_database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('[USER-MNGMNT] ❌ Error connecting to SQLite database:', err.message);
    } else {
        console.log('[USER-MNGMNT] ✅ Connected to SQLite database ', dbPath);
        initializeDatabase();
    }
});

// Promisify SQLite methods
const query = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
    });
});

module.exports = {
    db,
    query,
    get,
    run,
};
