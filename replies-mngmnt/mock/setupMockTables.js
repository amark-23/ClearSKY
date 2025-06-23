const { run } = require('../db/connection');

async function setupMockData() {
    try {
        // Δημιουργία requests πίνακα (αν δεν υπάρχει)
        await run(`
            CREATE TABLE IF NOT EXISTS requests (
                requestID INTEGER PRIMARY KEY AUTOINCREMENT,
                gradeID INTEGER,
                studentAM TEXT,
                instrID INTEGER,
                subjectID TEXT,
                reason TEXT
            )
        `);

        // Δημιουργία replies πίνακα (αν δεν υπάρχει)
        await run(`
            CREATE TABLE IF NOT EXISTS replies (
                replyID INTEGER PRIMARY KEY AUTOINCREMENT,
                requestID INTEGER,
                gradeID INTEGER,
                instrID INTEGER,
                studentAM TEXT,
                subjectID TEXT,
                time TEXT,
                text TEXT
            )
        `);

        // Εισαγωγή mock request (αν δεν υπάρχει ήδη)
        await run(`
            INSERT INTO requests (gradeID, studentAM, instrID, subjectID, text)
            VALUES (?, ?, ?, ?, ?)
        `, [101, 'AM123456', 1, 'CS101', 'Θέλω αναβαθμολόγηση γιατί έχει γίνει λάθος']);

        console.log('[MOCK] ✅ Mock data inserted successfully.');
    } catch (err) {
        console.error('[MOCK] ❌ Failed to setup mock data:', err.message);
    }
}

setupMockData();
