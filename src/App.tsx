import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged, auth, loginWithEmail } from './api';
import { syncUserProfile } from './services/userService';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Setup from './components/Setup';
import LogEntry from './components/LogEntry';
import Social from './components/Social';
import { BookOpen, Library as LibraryIcon, Edit3, Users, User as UserIcon, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';

type Tab = 'home' | 'library' | 'log' | 'social' | 'profile';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSetup, setShowSetup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        syncUserProfile();
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-primary" />
          <p className="font-headline italic text-xl text-primary">Entering The Sanctuary...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const handleLogin = (event: React.FormEvent) => {
      event.preventDefault();
      const name = displayName.trim();
      const normalizedEmail = email.trim().toLowerCase();
      if (!name || !normalizedEmail || !normalizedEmail.includes('@')) {
        setLoginError('Enter your name and a valid email address.');
        return;
      }
      setLoginError('');
      loginWithEmail(name, normalizedEmail);
    };

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-8"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="font-headline italic text-5xl text-primary">The Sanctuary</h1>
            <p className="text-on-surface-variant text-lg">
              Forge daily rituals, preserve your literary journey, and share the quiet hum of progress with friends.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-4 px-6 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <LogIn className="w-5 h-5" />
              Begin Your Journey
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Dashboard onNewRitual={() => setShowSetup(true)} />;
      case 'library': return <Library />;
      case 'log': return <LogEntry />;
      case 'social': return <Social />;
      case 'profile': return <div className="p-8 text-center"><p>Profile settings coming soon.</p></div>;
      default: return <Dashboard onNewRitual={() => setShowSetup(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col pb-24 md:pb-0 md:pl-72">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 hidden md:flex flex-col bg-surface-container-low border-r border-outline-variant/20 z-40 p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="font-headline italic text-primary text-xl">The Sanctuary</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <NavItem 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Home" 
          />
          <NavItem 
            active={activeTab === 'library'} 
            onClick={() => setActiveTab('library')} 
            icon={<LibraryIcon className="w-5 h-5" />} 
            label="Library" 
          />
          <NavItem 
            active={activeTab === 'log'} 
            onClick={() => setActiveTab('log')} 
            icon={<Edit3 className="w-5 h-5" />} 
            label="Reading Log" 
          />
          <NavItem 
            active={activeTab === 'social'} 
            onClick={() => setActiveTab('social')} 
            icon={<Users className="w-5 h-5" />} 
            label="Social" 
          />
        </nav>

        <div className="mt-auto pt-8 border-t border-outline-variant/20">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-colors font-semibold"
          >
            <UserIcon className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-background/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex justify-between items-center w-full border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <h1 className="font-headline italic text-primary text-lg">The Sanctuary</h1>
        </div>
        <button className="text-primary p-2">
          <UserIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <div className="bg-surface-container-low/90 backdrop-blur-2xl rounded-full px-4 py-2 shadow-2xl flex justify-around items-center border border-outline-variant/20">
          <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<BookOpen className="w-5 h-5" />} label="Home" />
          <MobileNavItem active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<LibraryIcon className="w-5 h-5" />} label="Library" />
          <MobileNavItem active={activeTab === 'log'} onClick={() => setActiveTab('log')} icon={<Edit3 className="w-5 h-5" />} label="Log" />
          <MobileNavItem active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users className="w-5 h-5" />} label="Social" />
        </div>
      </nav>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <Setup onClose={() => setShowSetup(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold w-full text-left",
        active 
          ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
          : "text-on-surface-variant hover:bg-surface-container-highest"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 transition-all group",
        active ? "text-primary scale-110" : "text-on-surface-variant/50 hover:text-primary"
      )}
    >
      <div className={cn("mb-0.5", active && "fill-current")}>{icon}</div>
      <span className="font-sans text-[10px] tracking-widest uppercase font-bold">{label}</span>
    </button>
  );
}
