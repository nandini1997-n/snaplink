require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { redirectLink } = require('./controllers/linkController');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/links', require('./routes/links'));

// Public redirect route (must be last)
app.get('/:slug', redirectLink);

app.get('/', (req, res) => {
  res.json({ message: '🔗 SnapLink API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
