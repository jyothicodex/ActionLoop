import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Here you would also typically save the user's name to a Firestore user profile
        await createUserWithEmailAndPassword(auth, email, password);
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
    >
      <motion.div 
        className="auth-card glass-panel"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-purple)', filter: 'blur(80px)', opacity: 0.5, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--accent-blue)', filter: 'blur(80px)', opacity: 0.5, borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <motion.div layoutId="logo-icon" style={{ display: 'inline-block', marginBottom: '1rem' }}>
               <svg width="48" height="24" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 10C18.9543 10 10 18.9543 10 30C10 41.0457 18.9543 50 30 50C43 50 48 35 60 35C72 35 77 50 90 50C101.046 50 110 41.0457 110 30C110 18.9543 101.046 10 90 10C77 10 72 25 60 25C48 25 43 10 30 10Z" stroke="url(#paint0_linear_auth)" strokeWidth="8" strokeLinecap="round"/>
                <path d="M25 40L35 25L45 40" stroke="url(#paint1_linear_auth)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M90 20V30M85 25H95" stroke="var(--accent-purple-light)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="paint0_linear_auth" x1="10" y1="30" x2="110" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#c77dff"/>
                    <stop offset="1" stopColor="#9d4edd"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_auth" x1="25" y1="32.5" x2="45" y2="32.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff00ff"/>
                    <stop offset="1" stopColor="#9d4edd"/>
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isLogin ? 'Enter your details to access ActionLoop' : 'Join ActionLoop to start achieving more'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="input-group" style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      style={{
                        width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px', color: 'var(--text-primary)',
                        outline: 'none', transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group" style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px', color: 'var(--text-primary)',
                  outline: 'none', transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px', color: 'var(--text-primary)',
                  outline: 'none', transition: 'all 0.3s ease'
                }}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ color: '#ff4d4d', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '0.5rem', borderRadius: '8px' }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                color: 'white', border: 'none', padding: '0.875rem', borderRadius: '12px',
                fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.5rem', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(157, 78, 221, 0.3)'
              }}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ color: 'var(--accent-purple-light)', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease' }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Auth;
