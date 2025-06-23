const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'grades_stats.sqlite'), (err) => {
    if (err) console.error('❌ Error opening database:', err);
    else {
        console.log('✅ Connected to SQLite grades_stats.sqlite database');
        initializeDb();
    }
});

// Δημιουργία πινάκων χωρίς mock δεδομένα
function initializeDb() {
    db.serialize(() => {
        // Δημιουργία πίνακα grades
        db.run(`
            CREATE TABLE IF NOT EXISTS grades (
                gradeID INTEGER PRIMARY KEY,
                AMnumber TEXT NOT NULL,
                studentName TEXT NOT NULL,
                studentMail TEXT NOT NULL,
                period TEXT NOT NULL,
                instrID INTEGER NOT NULL,
                subID INTEGER NOT NULL,
                scale TEXT NOT NULL,
                grade INTEGER NOT NULL,
                submissionDate TEXT NOT NULL
            )
        `);

        // Δημιουργία πίνακα subjects
        db.run(`
            CREATE TABLE IF NOT EXISTS subjects (
                subjectID INTEGER PRIMARY KEY,
                subjectName TEXT NOT NULL,
                instructorID INTEGER NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('[GRADES-STATISTICS] ❌ Error creating subjects table:', err.message);
            } else {
                db.run(`INSERT OR IGNORE INTO subjects (subjectID, subjectName, instructorID) VALUES (101, 'Φυσική', 1)`);
                db.run(`INSERT OR IGNORE INTO subjects (subjectID, subjectName, instructorID) VALUES (201, 'Λογισμικό', 2)`);
                db.run(`INSERT OR IGNORE INTO subjects (subjectID, subjectName, instructorID) VALUES (303, 'Μαθηματικά', 3)`, () => {
                    console.log('[GRADES-STATISTICS] ✅ Subjects initialized');
                });
            }
        });
    });
}

module.exports = {
    run: (sql, params = []) =>
        new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        }),

    get: (sql, params = []) =>
        new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }),

    all: (sql, params = []) =>
        new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }),
};
