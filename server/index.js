import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Adjust for your frontend URL
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finance-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String,
});
const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  amount: Number,
  category: String,
  type: { type: String, enum: ['income', 'expense'] },
  date: String,
  notes: String,
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Budget Schema
const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  limit: Number,
  period: { type: String, enum: ['weekly', 'monthly'] },
  startDate: String,
  spent: { type: Number, default: 0 },
});
const Budget = mongoose.model('Budget', budgetSchema);

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name, email, avatar: user.avatar } });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// Transaction Routes
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
  const { title, amount, category, type, date, notes } = req.body;
  try {
    const transaction = new Transaction({
      userId: req.userId,
      title,
      amount,
      category,
      type,
      date,
      notes,
    });
    await transaction.save();
    if (type === 'expense') {
      await Budget.updateOne(
        { userId: req.userId, category },
        { $inc: { spent: amount } }
      );
    }
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, type, date, notes } = req.body;
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { title, amount, category, type, date, notes },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.userId });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Budget Routes
app.get('/api/budgets', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/budgets', authMiddleware, async (req, res) => {
  const { category, limit, period, startDate } = req.body;
  try {
    const budget = new Budget({
      userId: req.userId,
      category,
      limit,
      period,
      startDate,
      spent: 0,
    });
    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.put('/api/budgets/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { category, limit, period, startDate } = req.body;
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { category, limit, period, startDate },
      { new: true }
    );
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

app.delete('/api/budgets/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const budget = await Budget.findOneAndDelete({ _id: id, userId: req.userId });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});