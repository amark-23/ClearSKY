require('dotenv').config();
const express = require('express');
const cors = require('cors');
const gradesRoutes = require('./routes/grades');

const app = express();
app.use(cors()); 
app.use(express.json());

app.use('/api', gradesRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`📊 Grades service running on port ${PORT}`));
