import { useState, useEffect } from 'react';
import { auth } from '../api';
import { searchUsers } from '../services/userService';
import { createRitual } from '../services/ritualService';
import { subscribeToUserBooks } from '../services/bookService';
import { UserProfile, Book } from '../types';
import { X, Search, UserPlus, Book as BookIcon, Clock, Check, ChevronRight, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

export default function Setup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [ritualType, setRitualType] = useState<'shared' | 'individual'>('individual');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [threshold, setThreshold] = useState('20');
  const [reminderTime, setReminderTime] = useState('20:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = subscribeToUserBooks(auth.currentUser.uid, setBooks);
    return () => unsubscribe();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchUsers(searchQuery);
    // Filter out current user
    setSearchResults(results.filter(u => u.uid !== auth.currentUser?.uid));
  };

  const handleCreate = async () => {
    if (!auth.currentUser || !selectedFriend) return;
    setLoading(true);
    try {
      await createRitual({
        name: ritualType === 'shared' ? `Shared: ${selectedBook?.title}` : `Reading with ${selectedFriend.displayName}`,
        members: [auth.currentUser.uid, selectedFriend.uid],
        modality: ritualType,
        sharedBookId: ritualType === 'shared' ? selectedBook?.id : undefined,
        dailyThreshold: parseInt(threshold),
        logTime: reminderTime,
        lastSyncDate: null,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-headline italic text-3xl text-primary">Find a Companion</h3>
              <p className="text-on-surface-variant">Reading is a solitary act, but progress is a shared joy.</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search by email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
              >
                Search
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
              {searchResults.map(user => (
                <button 
                  key={user.uid}
                  onClick={() => setSelectedFriend(user)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                    selectedFriend?.uid === user.uid 
                      ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                      : "bg-surface-container-low border-outline-variant/10 hover:border-primary/30"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-on-surface">{user.displayName}</p>
                    <p className="text-xs text-on-surface-variant">{user.email}</p>
                  </div>
                  {selectedFriend?.uid === user.uid && (
                    <div className="w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
              {searchResults.length === 0 && searchQuery && (
                <p className="text-center py-8 text-on-surface-variant italic">No companions found with that email.</p>
              )}
            </div>

            <button 
              disabled={!selectedFriend}
              onClick={() => setStep(2)}
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="font-headline italic text-3xl text-primary">Define the Ritual</h3>
              <p className="text-on-surface-variant">Choose how you wish to journey together.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setRitualType('individual')}
                className={cn(
                  "p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center",
                  ritualType === 'individual' 
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                    : "bg-surface-container-low border-outline-variant/10 hover:border-primary/30"
                )}
              >
                <User className="w-8 h-8 text-primary/60" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Individual Books</p>
                  <p className="text-[10px] text-on-surface-variant leading-tight">Read different books at your own pace</p>
                </div>
              </button>
              <button 
                onClick={() => setRitualType('same')}
                className={cn(
                  "p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center",
                  ritualType === 'same' 
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                    : "bg-surface-container-low border-outline-variant/10 hover:border-primary/30"
                )}
              >
                <Users className="w-8 h-8 text-primary/60" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Shared Book</p>
                  <p className="text-[10px] text-on-surface-variant leading-tight">Experience the same story together</p>
                </div>
              </button>
            </div>

            {ritualType === 'same' && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Select Common Book</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                  {books.map(book => (
                    <button 
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left",
                        selectedBook?.id === book.id 
                          ? "bg-primary/5 border-primary" 
                          : "bg-surface-container-low border-outline-variant/10"
                      )}
                    >
                      <BookIcon className="w-5 h-5 text-primary/40" />
                      <div className="flex-grow">
                        <p className="font-bold text-sm truncate">{book.title}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{book.author}</p>
                      </div>
                    </button>
                  ))}
                  {books.length === 0 && (
                    <p className="text-xs text-on-surface-variant italic p-4 text-center">Add books to your library first.</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <BookIcon className="w-3 h-3" />
                  Daily Pages
                </label>
                <input 
                  type="number" 
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Reminder
                </label>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-grow bg-surface-container-highest text-on-surface-variant py-4 rounded-2xl font-bold hover:opacity-90 transition-all"
              >
                Back
              </button>
              <button 
                disabled={loading || (ritualType === 'same' && !selectedBook)}
                onClick={handleCreate}
                className="flex-grow bg-primary text-on-primary py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Forge Ritual'}
              </button>
            </div>
          </div>
        );
      default: return null;
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
        className="relative bg-background w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-outline-variant/10 overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-highest">
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: step === 1 ? '50%' : '100%' }}
            className="h-full bg-primary"
          />
        </div>

        {renderStep()}
      </motion.div>
    </div>
  );
}
