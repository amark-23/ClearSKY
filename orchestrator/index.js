const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const authRoutes = require('./routes/orchestrator/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: 'http://localhost:5000' }));
const studentEventsRoutes = require('./routes/orchestrator/studentEvents');
const gradesUpdateRouter = require('./routes/orchestrator/gradesUpdate');
const gradeStatisticsRouter = require('./routes/orchestrator/gradesStatistics');
const viewGradesRouter = require('./routes/orchestrator/viewGrades.js');
const repliesRouter = require('./routes/replies');

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', require('./routes/submitRequest'));
app.use('/api', require('./routes/requests'));  
app.use('/api', studentEventsRoutes);
app.use('/api', gradesUpdateRouter);
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', gradeStatisticsRouter);
app.use('/api', viewGradesRouter);
app.use("/api/submissionInfo", require("./routes/submissionInfo"));
app.use('/api/submitReply', require('./routes/submitReply'));
app.use('/api', repliesRouter);
app.use('/api', require('./routes/repliedRequests'));


app.listen(PORT, () => {
    console.log(`[Orchestrator] ✅ Listening on http://localhost:${PORT}`);
});
