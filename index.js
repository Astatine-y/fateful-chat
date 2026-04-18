const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const Stripe = require('stripe');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fateful-chat')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, email, credits: user.credits } });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, email, credits: user.credits } });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

app.post('/api/bazi', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.credits < 1) return res.status(402).json({ error: 'Insufficient credits' });

    // Simple bazi calculation (placeholder)
    const bazi = {
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯'
    };

    // AI interpretation
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const interpretation = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Interpret this Bazi: ${JSON.stringify(bazi)}` }],
      max_tokens: 500
    });

    user.credits -= 1;
    await user.save();

    res.json({
      bazi,
      interpretation: interpretation.choices[0]?.message?.content || 'Interpretation unavailable'
    });
  } catch (error) {
    res.status(500).json({ error: 'Bazi calculation failed' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});