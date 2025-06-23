const db = require('../db/connection');

async function receiveGradeUpdate(data) {
    const {
        gradeID,
        AMnumber,
        studentName,
        studentMail,
        period,
        instrID,
        subID,
        scale,
        grade,
        submissionDate, // <-- προσθήκη
    } = data;

    if (
        !gradeID ||
        !AMnumber ||
        !studentName ||
        !studentMail ||
        !period ||
        !instrID ||
        !subID ||
        !scale ||
        grade == null ||
        !submissionDate // <-- προσθήκη
    ) {
        throw new Error('Missing required grade data fields');
    }

    try {
        // 1. Διαγραφή παλιού βαθμού με το ίδιο gradeID (αν υπάρχει)
        const deleteSql = `
            DELETE FROM grades
            WHERE AMnumber = ?
              AND studentName = ?
              AND studentMail = ?
              AND period = ?
              AND instrID = ?
              AND subID = ?
              AND scale = ?
        `;
        await db.run(deleteSql, [AMnumber, studentName, studentMail, period, instrID, subID, scale]);

        // 2. Εισαγωγή νέου βαθμού με συγκεκριμένο gradeID
        const insertSql = `
            INSERT INTO grades (gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.run(insertSql, [gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate]);
    } catch (err) {
        console.error('[GRADE] ❌ Error syncing grade:', err.message);
        throw err;
    }
}

module.exports = receiveGradeUpdate;
