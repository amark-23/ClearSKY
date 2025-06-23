require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const replyRoute = require('./routes/replyToRequest');
const displayRoute = require('./routes/displayReplies');
const eventReceiver = require('./routes/receiveRequestUpdates');


const app = express();
app.use(bodyParser.json());

// Routes
app.use('/api', replyRoute);
app.use('/api', displayRoute);
app.use('/api', eventReceiver);


// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log(`[REPLIES-MS] ✅ Listening on http://localhost:${PORT}`));
