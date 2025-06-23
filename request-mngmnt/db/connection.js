const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Connect to SQLite database
const dbPath = path.join(dataDir, 'request_database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('[REQUEST-MNGMNT] ❌ Error connecting to SQLite database:', err.message);
    } else {
        console.log('[REQUEST-MNGMNT] ✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database with required tables
function initializeDatabase() {
    db.serialize(() => {
        // Students table
        db.run(`
            CREATE TABLE IF NOT EXISTS students (
                                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    AMnumber TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('[REQUEST-MNGMNT] ❌ Error creating students table:', err.message);
            } else {
                console.log('[REQUEST-MNGMNT] ✅ Students table ready');
            }
        });

        // Grades table
        db.run(`
            CREATE TABLE IF NOT EXISTS grades (
                gradeID INTEGER PRIMARY KEY,
                AMnumber TEXT NOT NULL,
                studentName TEXT NOT NULL,
                studentMail TEXT NOT NULL,
                period TEXT NOT NULL,
                instrID integer NOT NULL,
                subID integer NOT NULL,
                scale TEXT NOT NULL,
                grade integer NOT NULL,
                submissionDate TEXT NOT NULL,
                UNIQUE(AMnumber, subID, period, scale)
            )
        `, (err) => {
            if (err) {
                console.error('[REQUEST-MNGMNT] ❌ Error creating grades table:', err.message);
            } else {
                console.log('[REQUEST-MNGMNT] ✅ Grades table ready');
            }
        });

        // Requests table
        db.run(`
            CREATE TABLE IF NOT EXISTS requests (
                requestID INTEGER PRIMARY KEY AUTOINCREMENT,
                gradeID INTEGER NOT NULL,
                studentAM TEXT NOT NULL,
                instrID integer NOT NULL,
                subjectID integer NOT NULL,
                time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                text TEXT
            )
        `, (err) => {
            if (err) {
                console.error('[REQUEST-MNGMNT] ❌ Error creating requests table:', err.message);
            } else {
                console.log('[REQUEST-MNGMNT] ✅ Requests table ready');
            }
        });
    });
}

// Promisify SQLite methods
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

module.exports = {
    query,
    get,
    run,
    db
};
