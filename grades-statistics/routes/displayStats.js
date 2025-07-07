const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/distribution', async (req, res) => {
  const { subjectName, period } = req.query;
  const debug = {
    input: { subjectName, period },
    queries: [],
    results: [],
    messages: [],
  };

  try {
    // Debug: Δες τι υπάρχει στον πίνακα grades
    const allGrades = await db.all("SELECT * FROM grades");
    //debug.allGrades = allGrades;
    //console.log("[DEBUG] Όλα τα grades:", allGrades);

    // Debug: Δες τι υπάρχει στον πίνακα subjects
    const allSubjects = await db.all("SELECT * FROM subjects");
    //debug.allSubjects = allSubjects;
    //console.log("[DEBUG] Όλα τα subjects:", allSubjects);

    // Debug: Δες τι επιστρέφει το αρχικό query για subject-period
    const allSP = await db.all(`
      SELECT DISTINCT s.subjectID, s.subjectName, g.period
      FROM grades g
      JOIN subjects s ON g.subID = s.subjectID
      GROUP BY s.subjectName ,g.period
      ORDER BY s.subjectName, g.period
    `);
    
    console.log("[DEBUG] Όλα τα subject-period:", allSP);

    const results = [];

    for (const sp of allSP) {
      const { subjectID, subjectName, period } = sp;
      debug.messages.push(`Processing: subjectID=${subjectID}, subjectName=${subjectName}, period=${period}`);

      const whereClauses = [];
      const params = [];

      if (subjectID !== null) {
        whereClauses.push("grades.subID = ?");
        params.push(subjectID);
      }
      if (period !== null) {
        whereClauses.push("grades.period = ?");
        params.push(period);
      }
      const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const distSQL = `
        WITH grades_range AS (
          SELECT 0 AS grade UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
          SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
          SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
        )
        SELECT grades_range.grade, COUNT(grades.grade) AS count
        FROM grades_range
        LEFT JOIN grades ON grades.grade = grades_range.grade
        ${whereSQL}
        GROUP BY grades_range.grade
        ORDER BY grades_range.grade ASC
      `;
      const distribution = await db.all(distSQL, params);
      //debug.queries.push({ sql: distSQL, params, result: distribution });
      console.log(`[DEBUG] Distribution για ${subjectName} / ${period}:`, distribution);

      const qDistributions = {};
      for (let i = 1; i <= 10; i++) {
        const qField = `Q${i.toString().padStart(2, '0')}`;

        const qSQL = `
          WITH grades_range AS (
            SELECT 0 AS grade UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
            SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
            SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
          )
          SELECT grades_range.grade AS grade, COUNT(g.${qField}) AS count
          FROM grades_range
          LEFT JOIN grades g ON g.${qField} = grades_range.grade
          WHERE g.subID = ? AND g.period = ?
          GROUP BY grades_range.grade
          ORDER BY grades_range.grade ASC
        `;

        const qResult = await db.all(qSQL, [subjectID, period]);
        qDistributions[qField] = qResult;

        console.log("[STATS] RESULT FOR Q-XX: ", qResult);

        debug.queries.push({
          sql: qSQL,
          params: [subjectID, period],
          question: qField,
          subjectName,
          period,
          result: qResult,
        });
      }



      results.push({
        subjectName,
        period,
        distribution,
        qDistributions
      });
    }

    debug.messages.push("Returning all subject-period distributions");

    return res.json({
      message: "All subjects and periods distribution",
      allDistributions: results,
      debug,
    });

  } catch (err) {
    console.error('Error fetching distribution:', err);
    debug.error = err.message;
    return res.status(500).json({ message: "Internal server error", debug });
  }
});

module.exports = router;
