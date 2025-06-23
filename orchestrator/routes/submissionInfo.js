const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const { subjectName, period } = req.query;
    console.log("[DEBUG] Received query params:", { subjectName, period });

    const response = await axios.get("http://view-grades:3009/api/submissionInfo", {
      params: { subjectName, period }
    });

    console.log("[DEBUG] Response from view-grades:", response.data);

    res.json(response.data);
  } catch (err) {
    console.error("[ORCH submissionInfo error]", err.message);
    if (err.response) {
      console.error("[DEBUG] Error response data:", err.response.data);
    }
    res.status(500).json({ message: "Failed to retrieve submission info" });
  }
});

module.exports = router;
