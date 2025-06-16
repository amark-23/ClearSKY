const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5001;
const pool = require("./db");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Grades Service is running");
});

app.listen(PORT, () => {
  console.log(`Grades service running on port ${PORT}`);
});
