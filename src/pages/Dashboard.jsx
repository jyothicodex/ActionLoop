import React, { useState, useEffect } from 'react';
import '../index.css';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { getTasksQuery } from '../firebase/tasks';
import { onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Edit2, Check } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = getTasksQuery(auth.currentUser.uid);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute Greeting Name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User'
  );

  const userName = displayName.split(' ')[0];

  const handleSaveName = async () => {
    if (!auth.currentUser || !editNameValue.trim()) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateProfile(auth.currentUser, { displayName: editNameValue.trim() });
      setDisplayName(editNameValue.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating profile name:", error);
      setIsEditingName(false);
    }
  };

  // Find active tasks
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  
  // Logic to find priority task (simple logic: first high priority, else first task)
  const priorityTask = activeTasks.find(t => t.priority === 'High') || activeTasks[0];
  
  // Next 3 deadlines
  const upcomingTasks = activeTasks.slice(0, 3);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>{getGreetingTime()},</h1>
              <input 
                type="text" 
                value={editNameValue} 
                onChange={(e) => setEditNameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                style={{ 
                  fontSize: '2rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', 
                  color: 'white', padding: '0.2rem 0.5rem', width: '200px', outline: 'none' 
                }} 
              />
              <button onClick={handleSaveName} style={{ background: 'var(--accent-purple)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', group: 'hover' }}>
              <h1 style={{ margin: 0 }}>{getGreetingTime()}, {userName}! 👋</h1>
              <button 
                onClick={() => {
                  setEditNameValue(userName);
                  setIsEditingName(true);
                }}
                className="edit-name-btn"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', opacity: 0.5, transition: 'opacity 0.2s' }}
                title="Edit Name"
              >
                <Edit2 size={18} />
              </button>
            </div>
          )}
        </div>
        <p style={{ marginTop: '0.5rem' }}>You've got great things planned for today. Let's execute.</p>
      </div>

      <div className="dashboard-grid">
        {loading ? (
           <div className="glass-panel card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
           </div>
        ) : !priorityTask ? (
           <div className="glass-panel card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <h2 style={{ marginBottom: '1rem' }}>All caught up! 🎉</h2>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You have no pending tasks. Enjoy your day or plan ahead.</p>
             <button className="btn" onClick={() => navigate('/tasks')}>Go to Tasks</button>
           </div>
        ) : (
          <div className="glass-panel card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  {priorityTask.priority === 'High' && <span style={{ background: 'rgba(255, 0, 0, 0.2)', color: '#ff4d4d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>High Priority</span>}
                  <span style={{ background: 'rgba(255, 165, 0, 0.2)', color: '#ffa500', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>{priorityTask.status}</span>
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', wordBreak: 'break-word' }}>{priorityTask.title}</h2>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Estimated Time</div>
                    <div style={{ fontWeight: '600' }}>{priorityTask.time || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Category</div>
                    <div style={{ fontWeight: '600' }}>{priorityTask.category || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Deadline</div>
                    <div style={{ fontWeight: '600' }}>{priorityTask.deadline || '-'}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Why this task?</div>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>This task has been prioritized based on its {priorityTask.priority.toLowerCase()} priority and upcoming deadline.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn" onClick={() => navigate('/focus')}>Start Focus Session</button>
                  <button className="btn" onClick={() => navigate('/tasks')} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', boxShadow: 'none' }}>Manage Tasks</button>
                </div>
              </div>
              
              <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: `8px solid ${priorityTask.priority === 'High' ? '#ff4d4d' : 'var(--accent-purple)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{priorityTask.priority === 'High' ? '100' : priorityTask.priority === 'Medium' ? '50' : '20'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority Score</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Upcoming Tasks</h3>
              <span onClick={() => navigate('/tasks')} style={{ fontSize: '0.85rem', color: 'var(--accent-purple-light)', cursor: 'pointer' }}>View All</span>
            </div>
            
            {upcomingTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No upcoming tasks.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingTasks.map(task => (
                  <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{task.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{task.deadline || 'No deadline'}</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: task.priority === 'High' ? '#ff4d4d' : task.priority === 'Medium' ? '#ffa500' : '#4ade80' }}>
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
