import express from 'express';
import Book from '../models/Book.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const filter = userId ? { userId } : {};
    const books = await Book.find(filter);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: 'Invalid book update' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(400).json({ error: 'Invalid book id' });
  }
});

export default router;