import React, { useState, useEffect } from 'react';
import '../index.css';
import { auth } from '../firebase';
import { getTasksQuery } from '../firebase/tasks';
import { onSnapshot } from 'firebase/firestore';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export default function FocusMode() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  // Fetch tasks
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = getTasksQuery(auth.currentUser.uid);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().status !== 'Completed') {
          tasksData.push({ id: doc.id, ...doc.data() });
        }
      });
      setTasks(tasksData);
      
      // Auto-select highest priority task if none selected
      if (!selectedTaskId && tasksData.length > 0) {
        const priorityTask = tasksData.find(t => t.priority === 'High') || tasksData[0];
        setSelectedTaskId(priorityTask.id);
      }
    });
    return () => unsubscribe();
  }, []);

  // Timer logic
  // Timer tick logic
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // Timer completion logic
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (isBreak) {
        setIsBreak(false);
        setTimeLeft(FOCUS_TIME);
      } else {
        setIsBreak(true);
        setTimeLeft(BREAK_TIME);
      }
    }
  }, [timeLeft, isBreak, isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : FOCUS_TIME);
  };

  const switchMode = (toBreak) => {
    setIsRunning(false);
    setIsBreak(toBreak);
    setTimeLeft(toBreak ? BREAK_TIME : FOCUS_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG Circle calculation
  const totalTime = isBreak ? BREAK_TIME : FOCUS_TIME;
  const percentage = (timeLeft / totalTime) * 100;
  const strokeDashoffset = 1100 - (1100 * percentage) / 100;
  
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="focus-container" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', borderRadius: '30px', marginBottom: '2rem' }}>
        <button 
          onClick={() => switchMode(false)}
          style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, transition: 'all 0.3s', background: !isBreak ? 'var(--accent-purple)' : 'transparent', color: !isBreak ? 'white' : 'var(--text-secondary)' }}
        >
          <Brain size={18} /> Focus
        </button>
        <button 
          onClick={() => switchMode(true)}
          style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, transition: 'all 0.3s', background: isBreak ? 'var(--accent-blue)' : 'transparent', color: isBreak ? 'white' : 'var(--text-secondary)' }}
        >
          <Coffee size={18} /> Break
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem', width: '100%', maxWidth: '400px' }}>
        {tasks.length > 0 ? (
          <select 
            value={selectedTaskId} 
            onChange={(e) => setSelectedTaskId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', fontSize: '1.1rem', textAlign: 'center', appearance: 'none', outline: 'none', cursor: 'pointer' }}
          >
            {tasks.map(t => <option key={t.id} value={t.id} style={{ background: '#1a1a2e' }}>{t.title}</option>)}
          </select>
        ) : (
          <h2 style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>No active tasks. Add some in the Tasks tab!</h2>
        )}
      </div>

      <div style={{ 
        width: '350px', height: '350px', borderRadius: '50%', 
        border: `4px solid rgba(${isBreak ? '0, 191, 255' : '157, 78, 221'}, 0.2)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 50px rgba(${isBreak ? '0, 191, 255' : '157, 78, 221'}, 0.15), inset 0 0 50px rgba(${isBreak ? '0, 191, 255' : '157, 78, 221'}, 0.05)`,
        position: 'relative', marginBottom: '4rem'
      }}>
        <svg style={{ position: 'absolute', top: -4, left: -4, width: '358px', height: '358px', transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
          <circle 
            cx="179" cy="179" r="175" fill="none" 
            stroke={isBreak ? "var(--accent-blue)" : "var(--accent-purple-light)"} 
            strokeWidth="6" 
            strokeDasharray="1100" 
            strokeDashoffset={strokeDashoffset} 
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} 
          />
        </svg>
        
        <div style={{ fontSize: '5rem', fontWeight: 'bold', marginBottom: '1rem', color: isBreak ? 'var(--accent-blue)' : 'white', transition: 'color 0.5s ease' }}>
          {formatTime(timeLeft)}
        </div>
        <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          {isBreak ? 'Rest and Recharge' : 'Deep Focus'}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            style={{ background: isBreak ? 'var(--accent-blue)' : 'var(--accent-purple)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '30px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: `0 4px 15px rgba(${isBreak ? '0, 191, 255' : '157, 78, 221'}, 0.3)` }}
          >
            {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </motion.button>
        </div>
      </div>

      <div className="glass-panel" style={{ display: 'flex', gap: '3rem', padding: '1.5rem 3rem', borderRadius: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Selected Task</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedTask ? (selectedTask.title.length > 20 ? selectedTask.title.substring(0, 20) + '...' : selectedTask.title) : 'None'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Estimated Time</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedTask?.time || '-'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Priority</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedTask?.priority === 'High' ? '#ff4d4d' : selectedTask?.priority === 'Medium' ? '#ffa500' : '#4ade80' }}>
            {selectedTask?.priority || '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
