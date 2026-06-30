import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#060816',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Aurora / Glow background effects */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(157,78,221,0.2) 0%, rgba(6,8,22,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: -1
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          duration: 1, 
          ease: [0.16, 1, 0.3, 1],
          y: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <motion.div
          layoutId="logo-icon"
          style={{
            fontSize: '4rem',
            color: 'var(--accent-purple-light)',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 20px rgba(157,78,221,0.5))'
          }}
        >
          {/* Logo SVG matching the infinity shape in the mockup roughly */}
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 10C18.9543 10 10 18.9543 10 30C10 41.0457 18.9543 50 30 50C43 50 48 35 60 35C72 35 77 50 90 50C101.046 50 110 41.0457 110 30C110 18.9543 101.046 10 90 10C77 10 72 25 60 25C48 25 43 10 30 10Z" stroke="url(#paint0_linear)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M25 40L35 25L45 40" stroke="url(#paint1_linear)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M90 20V30M85 25H95" stroke="var(--accent-purple-light)" strokeWidth="3" strokeLinecap="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="10" y1="30" x2="110" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c77dff"/>
                <stop offset="1" stopColor="#9d4edd"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="25" y1="32.5" x2="45" y2="32.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff00ff"/>
                <stop offset="1" stopColor="#9d4edd"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.div
          layoutId="logo-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #a8a8a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ActionLoop
          </h1>
          <p style={{ color: 'var(--text-secondary)', letterSpacing: '0.2em', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            AI Coach for Your Next Best Action
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
