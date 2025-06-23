const express = require('express');
const app = express();

const statisticsRouter = require('./routes/displayStats');
const receiveGradeUpdateRouter = require('./routes/receiveGradeUpdate'); // 👈 νέο import

app.use(express.json());

// Routes
app.use('/api/statistics', statisticsRouter);
app.use('/api', receiveGradeUpdateRouter); // 👈 νέο route
app.post('/api/internal/update-grades', async (req, res) => {
  const grades = req.body;
  try {
    await receiveGradeUpdates(grades);
    res.status(200).json({ message: 'Grades updated' });
  } catch (err) {
    console.error('[GRADES-STATISTICS] ❌ Grade update error:', err.message);
    res.status(500).json({ error: 'Internal error updating grades' });
  }
});

// Error handling middleware (προαιρετικό)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
    console.log(`📊 Grades Statistics service running on port ${PORT}`);
});
