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
        submissionDate,
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
        !submissionDate
    ) {
        throw new Error('Missing required grade data fields');
    }

    try {
        const upsertSql = `
            INSERT INTO grades (
                gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(gradeID) DO UPDATE SET
                AMnumber=excluded.AMnumber,
                studentName=excluded.studentName,
                studentMail=excluded.studentMail,
                period=excluded.period,
                instrID=excluded.instrID,
                subID=excluded.subID,
                scale=excluded.scale,
                grade=excluded.grade,
                submissionDate=excluded.submissionDate
        `;
        await db.run(upsertSql, [
            gradeID, AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate
        ]);
    } catch (err) {
        console.error('[GRADE] ❌ Error syncing grade:', err.message);
        throw err;
    }
}

module.exports = receiveGradeUpdate;
