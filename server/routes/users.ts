import express from 'express';
import User from '../models/User.js';
import type { AuthenticatedRequest } from '../auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const authenticatedRequest = req as AuthenticatedRequest;
    const user = await User.findOneAndUpdate(
      { uid: authenticatedRequest.firebaseUser?.uid },
      {
        $set: {
          uid: authenticatedRequest.firebaseUser?.uid,
          displayName: authenticatedRequest.firebaseUser?.name || req.body.displayName,
          photoURL: authenticatedRequest.firebaseUser?.picture || req.body.photoURL,
          email: authenticatedRequest.firebaseUser?.email || req.body.email,
          dailyGoal: req.body.dailyGoal,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Invalid user profile' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const term = String(req.query.term || '').trim();
    if (!term) return res.json([]);
    const users = await User.find({
      $or: [
        { email: { $regex: term, $options: 'i' } },
        { displayName: { $regex: term, $options: 'i' } }
      ]
    }).limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:uid', async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).firebaseUser?.uid;
    if (req.params.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;