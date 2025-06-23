const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, 'replies_database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('[REPLIES-MS] ❌ DB error:', err.message);
    else {
        console.log('[REPLIES-MS] ✅ Connected to SQLite');
        initialize();
    }
});

function initialize() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS requests (
                requestID INTEGER PRIMARY KEY,
                gradeID INTEGER,
                studentAM TEXT,
                instrID INTEGER,
                subjectID INTEGER,
                time TEXT,
                text TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS replies (
                replyID INTEGER PRIMARY KEY AUTOINCREMENT,
                requestID INTEGER NOT NULL,
                gradeID INTEGER,
                instrID INTEGER,
                studentAM TEXT,
                subjectID INTEGER,
                time TEXT DEFAULT CURRENT_TIMESTAMP,
                text TEXT NOT NULL
            )
        `);
    });
}

const run = (sql, params = []) => new Promise((res, rej) => {
    db.run(sql, params, function (err) {
        if (err) rej(err);
        else res({ lastID: this.lastID, changes: this.changes });
    });
});

const get = (sql, params = []) => new Promise((res, rej) => {
    db.get(sql, params, (err, row) => {
        if (err) rej(err);
        else res(row);
    });
});

const all = (sql, params = []) => new Promise((res, rej) => {
    db.all(sql, params, (err, rows) => {
        if (err) rej(err);
        else res(rows);
    });
});

module.exports = { db, run, get, all };
