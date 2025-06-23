const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const { requestID, text } = req.body;
    const authHeader = req.headers.authorization;

    // Forward το reply στο replies-mngmnt microservice (port 3007)
    const response = await axios.post(
      "http://replies-mngmnt:3007/api/reply",
      { requestID, text },
      {
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[ORCH submitReply error]", err.message);
    if (err.response) {
      console.error("[DEBUG] Error response data:", err.response.data);
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ message: "Failed to submit reply" });
    }
  }
});

module.exports = router;