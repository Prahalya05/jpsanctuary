import express from 'express';
import Ritual from '../models/Ritual.js';
import type { AuthenticatedRequest } from '../auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).firebaseUser?.uid;
    const filter = { members: userId };
    const rituals = await Ritual.find(filter);
    res.json(rituals);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).firebaseUser?.uid;
    const newRitual = new Ritual({
      ...req.body,
      createdBy: userId,
      members: Array.from(new Set([userId, ...(req.body.members || [])])),
    });
    const savedRitual = await newRitual.save();
    res.status(201).json(savedRitual);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;