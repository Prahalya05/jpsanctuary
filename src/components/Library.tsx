import React, { useState, useEffect } from 'react';
import { auth } from '../api';
import { subscribeToUserBooks, addBook, deleteBook, updateBookProgress } from '../services/bookService';
import { Book } from '../types';
import { Plus, Book as BookIcon, Trash2, CheckCircle, Search, Filter, MoreVertical, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = subscribeToUserBooks(auth.currentUser.uid, (data) => {
      setBooks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesFilter = filter === 'all' || (filter === 'completed' ? book.isCompleted : !book.isCompleted);
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex flex-col gap-6">
        <div className="h-12 w-48 bg-surface-container-highest animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-[2/3] bg-surface-container-highest animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="font-headline italic text-4xl text-primary">Your Library</h2>
          <p className="text-on-surface-variant">A collection of journeys taken and yet to begin.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 font-bold"
        >
          <Plus className="w-5 h-5" />
          Add New Book
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search your collection..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-highest/50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
          <FilterButton active={filter === 'reading'} onClick={() => setFilter('reading')} label="Reading" />
          <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')} label="Completed" />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/40">
            <BookIcon className="w-10 h-10" />
          </div>
          <p className="text-on-surface-variant italic">No books found in this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {filteredBooks.map((book, index) => (
            <BookCard key={book.id || index} book={book} index={index} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && <AddBookModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
        active 
          ? "bg-primary text-on-primary shadow-md shadow-primary/10" 
          : "text-on-surface-variant hover:bg-surface-container-highest"
      )}
    >
      {label}
    </button>
  );
}

function BookCard({ book, index }: { book: Book, index: number, key?: string | number }) {
  const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col gap-4"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 bg-surface-container-highest">
        {book.coverURL ? (
          <img 
            src={book.coverURL} 
            alt={book.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-4 bg-gradient-to-br from-primary/10 to-primary/5">
            <BookIcon className="w-12 h-12 text-primary/20" />
            <span className="font-headline italic text-primary/60 text-sm leading-tight">{book.title}</span>
          </div>
        )}
        
        {book.status === 'completed' && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
            <CheckCircle className="w-4 h-4 fill-current" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3">
          <button 
            onClick={() => book.id && deleteBook(book.id)}
            className="w-full bg-red-500/20 hover:bg-red-500 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
          <button className="w-full bg-white/20 hover:bg-white text-white hover:text-black py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
            <Star className="w-3.5 h-3.5" />
            Favorite
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-headline italic text-lg text-on-surface leading-tight truncate">{book.title}</h4>
        <p className="text-xs text-on-surface-variant font-medium truncate">{book.author}</p>
        
        {book.status !== 'completed' && (
          <div className="pt-2 space-y-1.5">
            <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary"
              />
            </div>
            <p className="text-[10px] text-primary font-bold tracking-widest uppercase">
              {Math.round(progress)}% Complete
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AddBookModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await addBook({
        userId: auth.currentUser.uid,
        title,
        author,
        totalPages: parseInt(totalPages) || 0,
        addedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-background w-full max-w-md rounded-3xl p-8 shadow-2xl border border-outline-variant/10"
      >
        <h3 className="font-headline italic text-3xl text-primary mb-6">New Journey</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Book Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. The Night Circus"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Author</label>
            <input 
              required
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. Erin Morgenstern"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Total Pages</label>
            <input 
              required
              type="number" 
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. 387"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-grow bg-surface-container-highest text-on-surface-variant py-4 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-grow bg-primary text-on-primary py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add to Library'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
