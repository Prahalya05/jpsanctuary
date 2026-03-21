import React, { useState, useEffect } from 'react';
import { auth } from '../api';
import { subscribeToUserRituals, logReading } from '../services/ritualService';
import { subscribeToUserBooks, updateBookProgress } from '../services/bookService';
import { Ritual, Book } from '../types';
import { Book as BookIcon, Check, Flame, Calendar, ChevronRight, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

export default function LogEntry() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [pagesRead, setPagesRead] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubRituals = subscribeToUserRituals(auth.currentUser.uid, setRituals);
    const unsubBooks = subscribeToUserBooks(auth.currentUser.uid, setBooks);
    return () => {
      unsubRituals();
      unsubBooks();
    };
  }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedRitual || !selectedBook) return;
    setLoading(true);
    try {
      const pages = parseInt(pagesRead);
      await logReading({
        ritualId: selectedRitual.id!,
        userId: auth.currentUser.uid,
        bookId: selectedBook.id!,
        pagesRead: pages,
        date: new Date().toISOString(),
        isCompleted,
      });

      // Update book progress
      const newCurrentPage = selectedBook.currentPage + pages;
      await updateBookProgress(selectedBook.id!, newCurrentPage, isCompleted);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPagesRead('');
        setSelectedRitual(null);
        setSelectedBook(null);
        setIsCompleted(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10">
      <header className="space-y-2">
        <h2 className="font-headline italic text-4xl text-primary">Daily Log</h2>
        <p className="text-on-surface-variant">Preserve the quiet hum of your literary journey.</p>
      </header>

      <form onSubmit={handleLog} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Select Ritual */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <Flame className="w-3 h-3" />
              Active Ritual
            </label>
            <div className="grid grid-cols-1 gap-3">
              {rituals.map(ritual => (
                <button 
                  key={ritual.id}
                  type="button"
                  onClick={() => setSelectedRitual(ritual)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                    selectedRitual?.id === ritual.id 
                      ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                      : "bg-surface-container-low border-outline-variant/10 hover:border-primary/30"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-on-surface">Streak: {ritual.streakCount} Days</p>
                    <p className="text-xs text-on-surface-variant">Daily Goal: {ritual.threshold} Pages</p>
                  </div>
                  {selectedRitual?.id === ritual.id && (
                    <div className="w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
              {rituals.length === 0 && (
                <p className="text-sm text-on-surface-variant italic p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
                  No active rituals found.
                </p>
              )}
            </div>
          </div>

          {/* Select Book */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <BookIcon className="w-3 h-3" />
              Current Book
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {books.filter(b => !b.isCompleted).map(book => (
                <button 
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedBook(book)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                    selectedBook?.id === book.id 
                      ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                      : "bg-surface-container-low border-outline-variant/10 hover:border-primary/30"
                  )}
                >
                  <div className="w-10 h-14 bg-surface-container-highest rounded-md overflow-hidden shrink-0">
                    {book.coverURL && <img src={book.coverURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-on-surface truncate">{book.title}</p>
                    <p className="text-xs text-on-surface-variant truncate">{book.author}</p>
                  </div>
                  {selectedBook?.id === book.id && (
                    <div className="w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
              {books.filter(b => b.status !== 'completed').length === 0 && (
                <p className="text-sm text-on-surface-variant italic p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
                  No books in your reading list.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-[2.5rem] p-8 md:p-12 border border-outline-variant/10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <Edit3 className="w-3 h-3" />
                Pages Read Today
              </label>
              <input 
                required
                type="number" 
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
                className="w-full bg-background border border-outline-variant/20 rounded-2xl px-6 py-4 text-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="0"
              />
            </div>
            
            <button 
              type="button"
              onClick={() => setIsCompleted(!isCompleted)}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all font-bold",
                isCompleted 
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" 
                  : "bg-background border-outline-variant/20 text-on-surface-variant hover:border-emerald-500/50"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isCompleted ? "bg-emerald-500 border-emerald-500" : "border-outline-variant/30"
              )}>
                {isCompleted && <Check className="w-4 h-4 text-white" />}
              </div>
              I have completed this book
            </button>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading || !selectedRitual || !selectedBook || !pagesRead || success}
              className={cn(
                "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl",
                success 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-primary text-on-primary shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              )}
            >
              {loading ? 'Recording...' : success ? (
                <>
                  <Check className="w-6 h-6" />
                  Ritual Preserved
                </>
              ) : (
                <>
                  <Edit3 className="w-5 h-5" />
                  Preserve Today's Progress
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
