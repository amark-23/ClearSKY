// user-mngmnt/index.js
const express = require('express');
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');

const app = express();
app.use(express.json());
app.use('/auth/register', registerRoutes);
app.use('/auth/login', loginRoutes);
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`User Management listening on port ${PORT}`);
});