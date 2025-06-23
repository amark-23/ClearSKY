const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

const db = new sqlite3.Database(path.join(dbPath, 'grades.sqlite'), (err) => {
    if (err) console.error('[DB] ❌ Failed to connect:', err.message);
    else {
        console.log('[DB] ✅ Connected to SQLite');
        init();
    }
});

function init() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY,
                AMnumber TEXT UNIQUE
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS subjects (
                subjectID INTEGER PRIMARY KEY,
                subjectName TEXT NOT NULL,
                instructorID INTEGER NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('[VIEW-GRADES] ❌ Error creating subjects table:', err.message);
            } else {
                db.run(`INSERT OR IGNORE INTO subjects (subjectID, subjectName, instructorID) VALUES (101, 'Φυσική', 1)`);
                db.run(`INSERT OR IGNORE INTO subjects (subjectID, subjectName, instructorID) VALUES (201, 'Λογισμικό', 2)`);
                db.run(`INSERT OR IGNORE INTO subjects (subjectID, subjectName, instructorID) VALUES (303, 'Μαθηματικά', 3)`, () => {
                    console.log('[VIEW-GRADES] ✅ Subjects initialized');
                });
            }
        });
        db.run(`
            CREATE TABLE IF NOT EXISTS grades (
                gradeID INTEGER PRIMARY KEY AUTOINCREMENT,
                AMnumber TEXT NOT NULL,
                studentName TEXT NOT NULL,
                studentMail TEXT NOT NULL,
                period TEXT NOT NULL,
                instrID INTEGER NOT NULL,
                subID INTEGER NOT NULL,
                scale TEXT NOT NULL,
                grade REAL NOT NULL,
                submissionDate TEXT NOT NULL
            )
        `);
    });
}

const run = (sql, params = []) => new Promise((res, rej) => {
    db.run(sql, params, function(err) {
        if (err) rej(err);
        else res(this);
    });
});

const all = (sql, params = []) => new Promise((res, rej) => {
    db.all(sql, params, (err, rows) => {
        if (err) rej(err);
        else res(rows);
    });
});

const get = (sql, params = []) => new Promise((res, rej) => {
    db.get(sql, params, (err, row) => {
        if (err) rej(err);
        else res(row);
    });
});

module.exports = { db, run, all, get };
