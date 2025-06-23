require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

const userUpdateRoute = require('./routes/receiveUserUpdates');
const gradeUpdateRoute = require('./routes/receiveGradeUpdates');
const displayGradesRoute = require('./routes/displayGrades');

app.use('/api/receiveUserUpdates', userUpdateRoute);
app.use('/api/receiveGradeUpdates', gradeUpdateRoute);
app.use('/api/displayGrades', displayGradesRoute);
app.use('/api/submissionInfo', require('./routes/submissionInfo'));

app.post('/api/internal/update-grades', async (req, res) => {
  const grades = req.body;
  try {
    await receiveGradeUpdates(grades);
    res.status(200).json({ message: 'Grades updated' });
  } catch (err) {
    console.error('[VIEW-GRADES] ❌ Grade update error:', err.message);
    res.status(500).json({ error: 'Internal error updating grades' });
  }
});

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => console.log(`[VIEW-GRADES-MS] ✅ Listening on port ${PORT}`));
