const express = require("express");
const router = express.Router();
const dbPromise = require("../db/connection");

router.get("/", async (req, res) => {
  const { subjectName, period } = req.query;
  console.log("[DEBUG] Received query params:", { subjectName, period });

  if (!subjectName || !period) {
    console.warn("[DEBUG] Missing subjectName or period");
    return res.status(400).json({ message: "subjectName and period are required" });
  }

  try {
    const db = await dbPromise;
    console.log("[DEBUG] Got DB connection, Name: ",subjectName);

    const subjectRow = await db.get(
      `SELECT subjectID FROM subjects WHERE subjectName = ?`,
      [subjectName]
    );
    console.log("[DEBUG] subjectRow:", subjectRow);

    if (!subjectRow) {
      console.warn("[DEBUG] Subject not found for:", subjectName);
      return res.status(404).json({ message: "Subject not found" });
    }

    const subjectID = subjectRow.subjectID;
    console.log("[DEBUG] subjectID:", subjectID);

    const dates = await db.all(
      `SELECT submissionDate FROM grades
       WHERE subID = ? AND period = ?
       ORDER BY submissionDate DESC
       LIMIT 2`,
      [subjectID, period]
    );
    console.log("[DEBUG] dates:", dates);

    const lastSubmission = dates[0]?.submissionDate || "";
    const secondLastSubmission = dates[1]?.submissionDate || "";

    console.log("[DEBUG] lastSubmission:", lastSubmission, "secondLastSubmission:", secondLastSubmission);

    res.json({
      subjectName,
      period,
      lastSubmission,
      secondLastSubmission,
    });
  } catch (err) {
    console.error("[GRADES-MS submissionInfo error]", err.message);
    res.status(500).json({ message: "Database error in submissionInfo" });
  }
});

module.exports = router;
