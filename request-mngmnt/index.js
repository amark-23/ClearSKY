require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// οι routers σου
const receiveUserUpdateRoutes = require('./utils/receiveUserUpdate');
const submitRequestRoutes    = require('./routes/submitRequest');
const eventReceiver          = require('./routes/eventReceiver');
const requestDisplaying = require('./routes/displayRequest');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', receiveUserUpdateRoutes);   // /api/receiveUserUpdates
app.use('/api', submitRequestRoutes);       // /api/submit-request
app.use('/api', eventReceiver);      // << αυτό προσθέτεις
app.use('/api',requestDisplaying);

app.post('/api/internal/update-grades', async (req, res) => {
  const grades = req.body;
  try {
    await receiveGradeUpdates(grades);
    console.log(`[GRADE] ✅ Inserted ${grades.length} grades`);
    res.status(200).json({ message: 'Grades updated' });
  } catch (err) {
    console.error('[REQUEST-MNGMNT] ❌ Grade update error:', err.message);
    res.status(500).json({ error: 'Internal error updating grades' });
  }
});

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[REQ-MS] ❌ Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start
app.listen(3003, '0.0.0.0', () => {
  console.log('[REQUEST-MNGMNT] Listening on port 3003');
});
