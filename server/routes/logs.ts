import express from 'express';
import Log from '../models/Log.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const ritualId = req.query.ritualId;
    const filter = ritualId ? { ritualId } : {};
    const logs = await Log.find(filter);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newLog = new Log(req.body);
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;