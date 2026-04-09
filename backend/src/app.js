require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const favoriteRoutes = require('./routes/favorites');
const agentRoutes = require('./routes/agent');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sports-odds-fullstack-ptosh4xuj-soumyos-projects-42da1269.vercel.app'
  ]
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/matches', matchRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/agent', agentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});