const axios = require('axios');

const services = [
  'http://request-mngmnt:3003/api/internal/update-grades',
  'http://grades-statistics:3011/api/internal/update-grades',
  'http://view-grades:3009/api/internal/update-grades'
];

async function broadcastGrades(grades) {
  for (const url of services) {
    try {
      await axios.post(url, grades);
      console.log(`[ORCH] ✅ Sent grades to ${url}`);
    } catch (err) {
      console.error(`[ORCH] ❌ Failed to send grades to ${url}:`, err.message);
    }
  }
}

module.exports = { broadcastGrades };