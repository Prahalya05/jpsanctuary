import express from 'express';
import Ritual from '../models/Ritual.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const filter = userId ? { members: userId } : {};
    const rituals = await Ritual.find(filter);
    res.json(rituals);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newRitual = new Ritual(req.body);
    const savedRitual = await newRitual.save();
    res.status(201).json(savedRitual);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;