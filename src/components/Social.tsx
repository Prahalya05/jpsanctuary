import React, { useState, useEffect } from 'react';
import { auth } from '../api';
import { subscribeToAllLogs } from '../services/ritualService';
import { Log } from '../types';
import { Book, Users, Flame, Calendar, ChevronRight, MessageCircle, Heart, Share2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { format, formatDistanceToNow } from 'date-fns';

export default function Social() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = subscribeToAllLogs((data) => {
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col gap-6">
        <div className="h-12 w-48 bg-surface-container-highest animate-pulse rounded-lg" />
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-surface-container-highest animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10 pb-32">
      <header className="space-y-2">
        <h2 className="font-headline italic text-4xl text-primary">The Sanctuary Feed</h2>
        <p className="text-on-surface-variant">Shared whispers of literary progress.</p>
      </header>

      <div className="space-y-8">
        {logs.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/40">
              <Users className="w-10 h-10" />
            </div>
            <p className="text-on-surface-variant italic">No activity yet. Start a ritual to see progress here.</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <ActivityCard key={log.id || index} log={log} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

function ActivityCard({ log, index }: { log: Log, index: number, key?: string | number }) {
  const isMe = log.userId === auth.currentUser?.uid;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start gap-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
          {isMe ? 'ME' : 'FR'}
        </div>
        
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-on-surface">
                {isMe ? 'You' : 'A companion'} <span className="font-normal text-on-surface-variant">preserved a ritual</span>
              </h4>
              <p className="text-xs text-on-surface-variant flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(log.date), { addSuffix: true })}
              </p>
            </div>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-surface-container-highest/30 rounded-2xl p-6 border border-outline-variant/5 flex items-center gap-6">
            <div className="w-16 h-24 bg-surface-container-highest rounded-lg shadow-md shrink-0 flex items-center justify-center text-primary/20">
              <Book className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-headline italic text-xl text-primary">Read {log.pagesRead} pages</p>
                <p className="text-xs text-on-surface-variant font-medium">In a quiet sanctuary of focus</p>
              </div>
              {log.isCompleted && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                  <Flame className="w-3 h-3 fill-current" />
                  Book Completed
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all group/btn">
              <div className="p-2 rounded-full group-hover/btn:bg-primary/10 transition-all">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">12</span>
            </button>
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all group/btn">
              <div className="p-2 rounded-full group-hover/btn:bg-primary/10 transition-all">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">3</span>
            </button>
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all group/btn ml-auto">
              <div className="p-2 rounded-full group-hover/btn:bg-primary/10 transition-all">
                <Share2 className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
