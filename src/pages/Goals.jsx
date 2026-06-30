import React, { useState, useEffect } from 'react';
import '../index.css';
import { Plus, X, Trash2, CheckCircle, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { onSnapshot } from 'firebase/firestore';
import { addGoal, deleteGoal, toggleMilestone, getGoalsQuery } from '../firebase/goals';
import { generateMilestones } from '../ai/gemini';
import { Sparkles } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New Goal Form State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [milestoneInputs, setMilestoneInputs] = useState(['', '', '']); // Start with 3 empty inputs
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = getGoalsQuery(auth.currentUser.uid);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const goalsData = [];
      querySnapshot.forEach((doc) => {
        goalsData.push({ id: doc.id, ...doc.data() });
      });
      setGoals(goalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !newGoalTitle) return;

    // Filter out empty milestones and format them
    const formattedMilestones = milestoneInputs
      .filter(m => m.trim() !== '')
      .map((m, index) => ({
        id: `m_${Date.now()}_${index}`,
        title: m.trim(),
        isCompleted: false
      }));

    const goalData = {
      title: newGoalTitle,
      targetDate: newGoalDate,
      milestones: formattedMilestones
    };

    try {
      await addGoal(auth.currentUser.uid, goalData);
      setIsModalOpen(false);
      setNewGoalTitle('');
      setNewGoalDate('');
      setMilestoneInputs(['', '', '']);
    } catch (error) {
      console.error("Error adding goal", error);
    }
  };

  const updateMilestoneInput = (index, value) => {
    const newInputs = [...milestoneInputs];
    newInputs[index] = value;
    setMilestoneInputs(newInputs);
  };

  const addMilestoneField = () => setMilestoneInputs([...milestoneInputs, '']);

  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.isCompleted).length;
    return Math.round((completed / milestones.length) * 100);
  };
  const handleMagicBreakdown = async () => {
    if (!newGoalTitle.trim()) {
      alert("Please enter a Goal Title first!");
      return;
    }
    setAiLoading(true);
    try {
      const generatedMilestones = await generateMilestones(newGoalTitle);
      if (generatedMilestones && generatedMilestones.length > 0) {
        setMilestoneInputs(generatedMilestones);
      }
    } catch (error) {
      alert("Oops! AI couldn't generate milestones right now.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="goals-container" style={{ position: 'relative', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Long-term Goals</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your big wins and break them down into actionable steps.</p>
        </div>
        <button className="btn" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Create Goal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading your goals...</p>
        ) : goals.length === 0 ? (
          <div className="glass-panel card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <Target size={48} color="var(--accent-purple)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h2>No goals set yet!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Aim high. Create your first goal to get started.</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = calculateProgress(goal.milestones);
            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel card" 
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}
              >
                <button 
                  onClick={() => deleteGoal(auth.currentUser?.uid, goal.id)}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.5, transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ff4d4d'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.opacity = '0.5'; }}
                >
                  <Trash2 size={18} />
                </button>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', paddingRight: '2rem' }}>{goal.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Target: {goal.targetDate || 'No date set'}</p>
                
                {/* Progress Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                    <span style={{ fontWeight: 'bold', color: progress === 100 ? '#4ade80' : 'white' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, type: 'spring' }}
                      style={{ height: '100%', background: progress === 100 ? '#4ade80' : 'var(--accent-purple)', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Milestones</h4>
                  {goal.milestones?.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {goal.milestones.map(milestone => (
                        <li 
                          key={milestone.id} 
                          onClick={() => toggleMilestone(auth.currentUser?.uid, goal.id, milestone.id)}
                          style={{ 
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem', 
                            cursor: 'pointer', padding: '0.5rem', borderRadius: '8px',
                            background: milestone.isCompleted ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.03)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ marginTop: '2px', color: milestone.isCompleted ? '#4ade80' : 'var(--text-secondary)' }}>
                            <CheckCircle size={16} />
                          </div>
                          <span style={{ 
                            fontSize: '0.95rem', 
                            textDecoration: milestone.isCompleted ? 'line-through' : 'none',
                            color: milestone.isCompleted ? 'var(--text-secondary)' : 'white'
                          }}>
                            {milestone.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No milestones defined.</p>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '1.5rem' }}>Create New Goal</h2>
              
              <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Goal Title</label>
                  <input type="text" required value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} placeholder="e.g. Become a Senior Developer" />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Target Date</label>
                  <input type="text" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} placeholder="e.g. Q4 2026 or Dec 31" />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Milestones (Break it down)</label>
                    <button 
                      type="button" 
                      onClick={handleMagicBreakdown} 
                      disabled={aiLoading}
                      style={{ 
                        background: 'rgba(157, 78, 221, 0.2)', color: 'var(--accent-purple-light)', 
                        border: '1px solid var(--accent-purple)', borderRadius: '12px', 
                        padding: '0.25rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.3s' 
                      }}
                    >
                      {aiLoading ? "Thinking..." : <><Sparkles size={14} /> Magic Breakdown</>}
                    </button>
                  </div>
                  {milestoneInputs.map((val, idx) => (
                    <input 
                      key={idx}
                      type="text" 
                      value={val} 
                      onChange={e => updateMilestoneInput(idx, e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white', marginBottom: '0.5rem' }} 
                      placeholder={`Milestone ${idx + 1}`} 
                    />
                  ))}
                  <button type="button" onClick={addMilestoneField} style={{ background: 'none', border: 'none', color: 'var(--accent-purple-light)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                    <Plus size={14} /> Add another milestone
                  </button>
                </div>
                
                <button type="submit" className="btn" style={{ marginTop: '1rem', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                  Save Goal
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
