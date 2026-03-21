import { useState, useEffect } from 'react';
import { auth } from '../api';
import { subscribeToUserRituals, subscribeToRitualLogs } from '../services/ritualService';
import { Ritual, Log } from '../types';
import { Plus, Flame, Book, Users, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { format, isToday, differenceInDays } from 'date-fns';

export default function Dashboard({ onNewRitual }: { onNewRitual: () => void }) {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = subscribeToUserRituals(auth.currentUser.uid, (data) => {
      setRituals(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col gap-6">
        <div className="h-12 w-48 bg-surface-container-highest animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-surface-container-highest animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="font-headline italic text-4xl text-primary">Your Rituals</h2>
          <p className="text-on-surface-variant">The quiet hum of consistent progress.</p>
        </div>
        <button 
          onClick={onNewRitual}
          className="bg-primary text-on-primary p-3 rounded-full shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {rituals.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-container-low rounded-3xl p-12 text-center border border-outline-variant/10 space-y-6"
        >
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/40">
            <Book className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-headline italic text-2xl text-on-surface">No active rituals</h3>
            <p className="text-on-surface-variant max-w-xs mx-auto">
              Invite a friend to start a reading streak and build a shared sanctuary of knowledge.
            </p>
          </div>
          <button 
            onClick={onNewRitual}
            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Start First Ritual
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rituals.map((ritual, index) => (
            <RitualCard key={ritual.id || index} ritual={ritual} index={index} />
          ))}
        </div>
      )}

      <section className="space-y-6 pt-8">
        <h3 className="font-headline italic text-2xl text-primary">Recent Activity</h3>
        <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 divide-y divide-outline-variant/10">
          <ActivityList />
        </div>
      </section>
    </div>
  );
}

function RitualCard({ ritual, index }: { ritual: Ritual, index: number, key?: string | number }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const currentUserId = auth.currentUser?.uid;
  const isIndividual = ritual.modality === 'individual';

  useEffect(() => {
    const unsubscribe = subscribeToRitualLogs(ritual.id, setLogs);
    return () => unsubscribe();
  }, [ritual.id]);

  const streak = ritual.streakCount || 0;

  // Check if a user has logged today
  const hasLoggedToday = (userId: string) => {
    return logs.some(log => 
      log.userId === userId && 
      log.timestamp && 
      isToday((log.timestamp as any).toDate ? (log.timestamp as any).toDate() : new Date(log.timestamp as any))
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 hover:border-primary/30 transition-all group relative overflow-hidden flex flex-col gap-8"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Flame className="w-40 h-40 text-primary" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Flame className="w-6 h-6 fill-current" />
              <span className="font-bold text-3xl">{streak} Day Streak</span>
            </div>
            <h4 className="font-headline italic text-2xl text-on-surface">
              {isIndividual ? 'Individual Journey' : 'Shared Sanctuary'}
            </h4>
          </div>
          <div className="flex -space-x-3">
            {ritual.members.map(id => (
              <div 
                key={id} 
                className={cn(
                  "w-12 h-12 rounded-full border-2 border-surface-container-low flex items-center justify-center text-xs font-bold transition-all",
                  hasLoggedToday(id) ? "bg-primary text-on-primary scale-110 z-10" : "bg-primary/10 text-primary"
                )}
              >
                {id.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-on-surface-variant text-sm bg-surface-container-highest/30 p-3 rounded-2xl">
            <Book className="w-5 h-5 text-primary/60" />
            <span>{ritual.sharedBookId ? 'Reading the same book' : 'Reading individual books'}</span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant text-sm bg-surface-container-highest/30 p-3 rounded-2xl">
            <Calendar className="w-5 h-5 text-primary/60" />
            <span>Daily check-in at {ritual.logTime}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Daily Progress</h5>
          <div className="space-y-3">
            {ritual.members.map(id => {
              const userLogs = logs.filter(l => l.userId === id);
              const todayLog = userLogs.find(l => l.timestamp && isToday((l.timestamp as any).toDate ? (l.timestamp as any).toDate() : new Date(l.timestamp as any)));
              const isMe = id === currentUserId;

              return (
                <div key={id} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-highest/20 border border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
                      hasLoggedToday(id) ? "bg-primary text-on-primary" : "bg-primary/5 text-primary/40"
                    )}>
                      {id.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-on-surface">
                      {isMe ? 'You' : `Friend (${id.slice(0, 4)})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {todayLog ? (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {todayLog.pagesRead} pages logged
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-variant italic">Waiting for log...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button className="flex-grow bg-primary text-on-primary py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            Log Today's Progress
          </button>
          <button className="p-4 rounded-2xl bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityList() {
  // Mock activity for now
  const activities = [
    { id: 1, user: 'You', action: 'logged 25 pages', time: '2 hours ago', book: 'The Great Gatsby' },
    { id: 2, user: 'Sarah', action: 'completed a ritual', time: '5 hours ago', book: 'Circe' },
    { id: 3, user: 'You', action: 'added a new book', time: 'Yesterday', book: 'Project Hail Mary' },
  ];

  return (
    <>
      {activities.map(activity => (
        <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-surface-container-highest/50 transition-all">
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <p className="text-on-surface">
              <span className="font-bold">{activity.user}</span> {activity.action}
            </p>
            <p className="text-xs text-on-surface-variant italic">{activity.book}</p>
          </div>
          <span className="text-xs text-on-surface-variant whitespace-nowrap">{activity.time}</span>
        </div>
      ))}
    </>
  );
}
