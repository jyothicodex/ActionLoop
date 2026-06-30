import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BrainCircuit, Target, Clock, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Components
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import AICoach from './pages/AICoach';
import FocusMode from './pages/FocusMode';
import Goals from './pages/Goals';
import Calendar from './pages/Calendar';
import ThreeBackground from './components/ThreeBackground';
import SplashScreen from './components/SplashScreen';
import Auth from './components/Auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

function Sidebar() {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', name: 'Tasks', icon: CheckSquare },
    { path: '/ai-coach', name: 'AI Coach', icon: BrainCircuit },
    { path: '/focus', name: 'Focus Mode', icon: Target },
    { path: '/goals', name: 'Goals', icon: Clock },
    { path: '/calendar', name: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <motion.div 
      className="sidebar"
      initial={{ opacity: 0, x: -50, y: 0 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        y: [0, -2, 0, 2, 0] 
      }}
      transition={{ 
        opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
        x: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
        y: { duration: 8, repeat: Infinity, ease: "linear" }
      }}
    >
      <div className="brand" style={{ marginBottom: '3rem' }}>
        <motion.div layoutId="logo-icon" className="brand-icon">
           <svg width="40" height="20" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 10C18.9543 10 10 18.9543 10 30C10 41.0457 18.9543 50 30 50C43 50 48 35 60 35C72 35 77 50 90 50C101.046 50 110 41.0457 110 30C110 18.9543 101.046 10 90 10C77 10 72 25 60 25C48 25 43 10 30 10Z" stroke="url(#paint0_linear_s)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M25 40L35 25L45 40" stroke="url(#paint1_linear_s)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M90 20V30M85 25H95" stroke="var(--accent-purple-light)" strokeWidth="3" strokeLinecap="round"/>
            <defs>
              <linearGradient id="paint0_linear_s" x1="10" y1="30" x2="110" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c77dff"/>
                <stop offset="1" stopColor="#9d4edd"/>
              </linearGradient>
              <linearGradient id="paint1_linear_s" x1="25" y1="32.5" x2="45" y2="32.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff00ff"/>
                <stop offset="1" stopColor="#9d4edd"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <motion.span layoutId="logo-text">ActionLoop</motion.span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
        {navItems.map((item, index) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}>
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                className={`nav-item-wrapper ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="active-nav-bg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(157, 78, 221, 0.15)',
                      borderRadius: '12px',
                      zIndex: -1,
                      border: '1px solid rgba(157, 78, 221, 0.3)'
                    }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="active-indicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                      position: 'absolute',
                      left: -10, top: '50%', transform: 'translateY(-50%)',
                      width: '4px', height: '20px',
                      background: 'var(--accent-purple-light)',
                      borderRadius: '4px',
                      boxShadow: '0 0 10px var(--accent-purple)'
                    }}
                  />
                )}
                <motion.div 
                  className="nav-item-content"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', color: isActive ? '#fff' : 'var(--text-secondary)' }}
                >
                  <motion.div 
                    className="nav-icon"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <item.icon size={20} />
                  </motion.div>
                  <span style={{ transition: 'color 0.3s ease' }}>{item.name}</span>
                </motion.div>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut(auth)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
            width: '100%', background: 'transparent', border: 'none', 
            color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.3s ease',
            borderRadius: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff4d4d';
            e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: 500 }}>Log Out</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function MainContent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/focus" element={<FocusMode />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global mouse glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Global Mouse Glow Element */}
      <div className="global-glow" />
      
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="app-container"
          >
            <div className="canvas-container" id="bg-canvas">
              <ThreeBackground />
            </div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--accent-purple)' }}>
                  Loading...
                </motion.div>
              ) : !user ? (
                <Auth key="auth" />
              ) : (
                <Router key="router">
                  <Sidebar />
                  <main className="main-content">
                    <MainContent />
                  </main>
                </Router>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
