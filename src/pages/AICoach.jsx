import React, { useState, useEffect } from 'react';
import '../index.css';
import { Send, Loader2, Info, X, Zap, ListTodo, BrainCircuit, Clock, BookOpen, Code, Activity } from 'lucide-react';
import { generateAIResponse, generateAgenticResponse } from '../ai/gemini';
import { addTask } from '../firebase/tasks';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function AICoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const docRef = doc(db, 'users', auth.currentUser.uid, 'chats', 'ai_coach');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().messages || []);
      } else {
        const initialMsg = [{ role: 'assistant', content: "Hi there! I'm your AI Coach 💫\n\nHow can I help you plan your day or focus better?" }];
        setMessages(initialMsg);
        setDoc(docRef, { messages: initialMsg });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading || !auth.currentUser) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    // Optimistic UI update
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const docRef = doc(db, 'users', auth.currentUser.uid, 'chats', 'ai_coach');
    await setDoc(docRef, { messages: newMessages }, { merge: true });

    try {
      const context = messages.map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n');
      const prompt = `Previous conversation:\n${context}\n\nUser: ${userMessage.content}`;
      
      const response = await generateAgenticResponse(prompt);
      
      let finalMessages;
      if (response.type === 'function_call' && response.name === 'addMultipleTasks') {
        const tasksToCreate = response.args.tasks || [];
        for (const t of tasksToCreate) {
          const taskData = {
            title: t.title || 'New Task',
            priority: t.priority || 'Medium',
            time: t.time || '',
            deadline: t.deadline || '',
            category: 'AI Coach',
            status: 'Not Started'
          };
          await addTask(auth.currentUser.uid, taskData);
        }
        finalMessages = [...newMessages, { role: 'assistant', content: response.text }];
      } else {
        finalMessages = [...newMessages, { role: 'assistant', content: response.content }];
      }
      
      await setDoc(docRef, { messages: finalMessages }, { merge: true });
    } catch (error) {
      console.error(error);
      const errorMessages = [...newMessages, { role: 'assistant', content: 'Oops! I encountered an error. Please check your API key and try again.' }];
      await setDoc(docRef, { messages: errorMessages }, { merge: true });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!auth.currentUser) return;
    const initialMsg = [{ role: 'assistant', content: "Hi there! I'm your AI Coach 💫\n\nHow can I help you plan your day or focus better?" }];
    const docRef = doc(db, 'users', auth.currentUser.uid, 'chats', 'ai_coach');
    await setDoc(docRef, { messages: initialMsg });
  };

  return (
    <div className="ai-coach-container" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1>AI Coach</h1>
          <button 
            onClick={() => setShowHelp(true)} 
            style={{ background: 'rgba(157, 78, 221, 0.2)', border: '1px solid var(--accent-purple)', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', transition: 'all 0.3s' }}
          >
            <Info size={16} /> How to use
          </button>
        </div>
        <button onClick={handleClear} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Clear Chat</button>
      </div>

      <div className="glass-panel card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '1rem 1.5rem',
                borderRadius: '20px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '20px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                maxWidth: '80%',
                lineHeight: '1.6',
                boxShadow: msg.role === 'user' ? '0 4px 15px rgba(157, 78, 221, 0.2)' : 'none'
              }}
            >
              {msg.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.startsWith('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : line}
                  {i !== msg.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '20px', borderBottomLeftRadius: '4px' }}
            >
              <Loader2 className="spinner" size={20} color="var(--accent-purple-light)" style={{ animation: 'spin 2s linear infinite' }} />
            </motion.div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '12px',
            padding: '0.5rem',
            border: '1px solid var(--glass-border)'
          }}>
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                outline: 'none'
              }}
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn" 
              style={{ 
                padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: (loading || !input.trim()) ? 0.5 : 1, cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ 
              position: 'absolute', top: '4rem', right: '0', width: '380px', background: 'rgba(20, 20, 40, 0.95)', 
              backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '20px', 
              padding: '1.5rem', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflowY: 'auto', maxHeight: 'calc(100vh - 10rem)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BrainCircuit size={20} color="var(--accent-purple-light)" /> Prompt Guide</h3>
              <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              The AI Coach is an <strong>Autonomous Agent</strong>. It doesn't just give advice—it can actively manage your workflow.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><Clock size={16} color="var(--accent-pink)" /> Time-Boxed Planning</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Give the AI your constraints and let it build a schedule.</p>
                <div 
                  onClick={() => { setInput("I have 6 hours today. I need to eat, exercise, and study for my exam. Build me a plan and add it to my board."); setShowHelp(false); }}
                  style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--accent-purple-light)', fontSize: '0.85rem', cursor: 'pointer', border: '1px dashed rgba(157, 78, 221, 0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(157, 78, 221, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                  title="Click to use this prompt"
                >
                  "I have 6 hours today. I need to eat, exercise, and study for my exam. Build me a plan and add it to my board."
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><BookOpen size={16} color="#3b82f6" /> The Student</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Let the AI organize your study sessions before a big test.</p>
                <div 
                  onClick={() => { setInput("I have exams next week. Create a 3-day study plan covering Math, Science, and History, and add them as high-priority tasks."); setShowHelp(false); }}
                  style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--accent-purple-light)', fontSize: '0.85rem', cursor: 'pointer', border: '1px dashed rgba(157, 78, 221, 0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(157, 78, 221, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                  title="Click to use this prompt"
                >
                  "I have exams next week. Create a 3-day study plan covering Math, Science, and History, and add them as high-priority tasks."
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><Code size={16} color="#10b981" /> The Developer</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Break down large engineering projects into ticket-sized tasks.</p>
                <div 
                  onClick={() => { setInput("Break down the process of building a landing page into 4 manageable tasks for today, with time estimates."); setShowHelp(false); }}
                  style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--accent-purple-light)', fontSize: '0.85rem', cursor: 'pointer', border: '1px dashed rgba(157, 78, 221, 0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(157, 78, 221, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                  title="Click to use this prompt"
                >
                  "Break down the process of building a landing page into 4 manageable tasks for today, with time estimates."
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><Activity size={16} color="#ef4444" /> Health & Habits</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Use the coach to enforce healthy routines and habit building.</p>
                <div 
                  onClick={() => { setInput("I want to get back into shape. Schedule 3 light 30-minute workouts for me this week on my board."); setShowHelp(false); }}
                  style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--accent-purple-light)', fontSize: '0.85rem', cursor: 'pointer', border: '1px dashed rgba(157, 78, 221, 0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(157, 78, 221, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                  title="Click to use this prompt"
                >
                  "I want to get back into shape. Schedule 3 light 30-minute workouts for me this week on my board."
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><Zap size={16} color="#ffb703" /> Overcome Procrastination</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stuck on a task? Ask the coach for a microscopic breakdown.</p>
                <div 
                  onClick={() => { setInput("I am overwhelmed by my coding assignment. What is the very first 5-minute step I should take?"); setShowHelp(false); }}
                  style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--accent-purple-light)', fontSize: '0.85rem', cursor: 'pointer', border: '1px dashed rgba(157, 78, 221, 0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(157, 78, 221, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                  title="Click to use this prompt"
                >
                  "I am overwhelmed by my coding assignment. What is the very first 5-minute step I should take?"
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
