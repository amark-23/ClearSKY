const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Endpoint: GET /api/statistics/distribution
// Query params (optional): subjectName, period
router.get('/distribution', async (req, res) => {
  const { subjectName, period } = req.query;

  try {
    // Αν δεν έχουν δοθεί παράμετροι, επιστρέφει κατανομή για όλα τα ζευγάρια (μάθημα-περίοδος)
    if (!subjectName && !period) {
      const allDistributions = await db.all(`
        SELECT 
          s.subjectName,
          g.period,
          gr.grade,
          COUNT(g.grade) as count
        FROM (
          SELECT 0 AS grade UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
          SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
          SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
        ) gr
        CROSS JOIN subjects s
        CROSS JOIN (SELECT DISTINCT period FROM grades) p
        LEFT JOIN grades g
          ON g.grade = gr.grade AND g.subID = s.subjectID AND g.period = p.period
        GROUP BY s.subjectName, g.period, gr.grade
        ORDER BY s.subjectName, g.period, gr.grade
      `);

      // Ομαδοποίηση ανά μάθημα-περίοδο
      const grouped = {};
      allDistributions.forEach(row => {
        const key = `${row.subjectName}__${row.period}`;
        if (!grouped[key]) {
          grouped[key] = {
            subjectName: row.subjectName,
            period: row.period,
            distribution: []
          };
        }
        grouped[key].distribution.push({ grade: row.grade, count: row.count });
      });

      // Φιλτράρουμε για να αφαιρέσουμε περιόδους null αν υπάρχει το μάθημα με περίοδο μη null
      const filteredGrouped = {};

      // Μαζεύουμε όλα τα μαθήματα που έχουν τουλάχιστον μία περίοδο μη null
      const subjectsWithNonNullPeriod = new Set(
        Object.values(grouped)
          .filter(entry => entry.period !== null)
          .map(entry => entry.subjectName)
      );

      Object.entries(grouped).forEach(([key, entry]) => {
        if (
          entry.period !== null ||
          !subjectsWithNonNullPeriod.has(entry.subjectName)
        ) {
          filteredGrouped[key] = entry;
        }
      });

      const result = Object.values(filteredGrouped);
      console.log("[STATISTICS] Filtered distribution for all subjects-periods:", JSON.stringify(result, null, 2));
      return res.json(result);
    }

    let conditions = [];
    let params = [];
    let queryParams = [];
    let subjectID = null;

    // Αν έχει δοθεί subjectName, βρίσκουμε το αντίστοιχο subjectID
    if (subjectName) {
      const subjectRow = await db.get(
        'SELECT subjectID FROM subjects WHERE subjectName = ?',
        [subjectName]
      );

      if (!subjectRow) {
        console.warn(`[STATISTICS] Subject not found: "${subjectName}"`);
        return res.status(200).json({
          subjectName,
          period: period || 'ALL',
          distribution: [],
          message: `Subject "${subjectName}" not found`
        });
      }
      subjectID = subjectRow.subjectID;
    }

    if (subjectID) queryParams.push(subjectID);
    if (period) queryParams.push(period);

    const distribution = await db.all(
      `
        WITH grades_range AS (
          SELECT 0 AS grade UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
          SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
          SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
        )
        SELECT 
          grades_range.grade, 
          COUNT(grades.grade) as count
        FROM grades_range
        LEFT JOIN grades 
          ON grades.grade = grades_range.grade
          ${subjectID ? 'AND grades.subID = ?' : ''}
          ${period ? 'AND grades.period = ?' : ''}
        GROUP BY grades_range.grade
        ORDER BY grades_range.grade ASC
      `,
      queryParams
    );

    const response = {
      subjectName: subjectName || 'ALL',
      period: period || 'ALL',
      distribution
    };
    console.log("[STATISTICS] Distribution for query:", JSON.stringify(response, null, 2));
    res.json(response);

  } catch (err) {
    console.error('[STATISTICS] Error fetching distribution:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
