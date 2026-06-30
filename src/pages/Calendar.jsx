import React, { useState, useEffect } from 'react';
import '../index.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { onSnapshot } from 'firebase/firestore';
import { getTasksQuery, addTask, deleteTask, updateTaskStatus } from '../firebase/tasks';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive State
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    priority: 'Medium',
    time: '',
    category: 'General'
  });

  // Fetch tasks
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = getTasksQuery(auth.currentUser.uid);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== 'Completed' && data.deadline) {
          tasksData.push({ id: doc.id, ...data });
        }
      });
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentShortMonthName = shortMonthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Generate grid cells
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getTasksForDay = (day) => {
    if (!day) return [];
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const deadlineLower = task.deadline.toLowerCase();
      const hasMonth = deadlineLower.includes(currentMonthName.toLowerCase()) || deadlineLower.includes(currentShortMonthName.toLowerCase());
      const regex = new RegExp(`\\b${day}(?:st|nd|rd|th)?(?:\\b|\\s|,)`, 'i');
      const hasDay = regex.test(deadlineLower);
      return hasMonth && hasDay;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#ff4d4d';
      case 'Medium': return '#ffa500';
      case 'Low': return '#4ade80';
      default: return 'var(--accent-purple)';
    }
  };

  const openAddTaskForSelectedDay = () => {
    const suffix = selectedDay === 1 || selectedDay === 21 || selectedDay === 31 ? 'st' : selectedDay === 2 || selectedDay === 22 ? 'nd' : selectedDay === 3 || selectedDay === 23 ? 'rd' : 'th';
    const formattedDate = `${currentMonthName} ${selectedDay}${suffix}`;
    setNewTask({ ...newTask, deadline: formattedDate });
    setIsModalOpen(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !newTask.title) return;
    try {
      await addTask(auth.currentUser.uid, newTask);
      setIsModalOpen(false);
      setNewTask({ title: '', deadline: '', priority: 'Medium', time: '', category: 'General' });
    } catch (error) {
      console.error("Error adding task", error);
      alert("Error adding task: " + error.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!auth.currentUser) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(auth.currentUser.uid, taskId);
      setSelectedDay(null); // Close panel if open
    }
  };

  return (
    <div className="calendar-container" style={{ position: 'relative', height: 'calc(100vh - 4rem)', display: 'flex', gap: '1.5rem' }}>
      
      {/* Main Calendar View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Schedule</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Click on any date to view or add tasks.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><ChevronLeft size={24} /></button>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select 
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                style={{ 
                  background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', 
                  fontWeight: 'bold', cursor: 'pointer', outline: 'none', appearance: 'none', padding: '0 0.2rem' 
                }}
              >
                {monthNames.map((m, i) => <option key={m} value={i} style={{ background: '#1a1a2e', fontSize: '1rem' }}>{m}</option>)}
              </select>
              <select 
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                style={{ 
                  background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', 
                  fontWeight: 'bold', cursor: 'pointer', outline: 'none', appearance: 'none', padding: '0 0.2rem' 
                }}
              >
                {Array.from({ length: 10 }, (_, i) => 2026 + i).map(year => (
                  <option key={year} value={year} style={{ background: '#1a1a2e', fontSize: '1rem' }}>{year}</option>
                ))}
              </select>
            </div>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><ChevronRight size={24} /></button>
          </div>
        </div>

        <div className="glass-panel card" style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ padding: '1rem', textAlign: 'center', fontWeight: '500', color: 'var(--text-secondary)' }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', flex: 1 }}>
            {days.map((day, index) => {
              const dayTasks = getTasksForDay(day);
              const today = isToday(day);
              const isSelected = selectedDay === day;
              
              return (
                <div 
                  key={index} 
                  onClick={() => day && setSelectedDay(isSelected ? null : day)}
                  style={{ 
                    borderRight: '1px solid rgba(255,255,255,0.05)', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    padding: '0.5rem',
                    background: isSelected ? 'rgba(157, 78, 221, 0.15)' : today ? 'rgba(157, 78, 221, 0.05)' : 'transparent',
                    cursor: day ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                >
                  {day && (
                    <>
                      <div style={{ 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', width: '30px', height: '30px', borderRadius: '50%',
                        background: today ? 'var(--accent-purple)' : 'transparent', color: today ? 'white' : 'var(--text-secondary)',
                        fontWeight: today ? 'bold' : 'normal', marginBottom: '0.5rem'
                      }}>
                        {day}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {dayTasks.map(task => (
                          <div 
                            key={task.id} 
                            style={{ 
                              fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)',
                              borderLeft: `3px solid ${getPriorityColor(task.priority)}`, borderRadius: '4px',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide-out Day View Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 350, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            style={{ overflow: 'hidden', flexShrink: 0 }}
          >
            <div className="glass-panel" style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentMonthName} {selectedDay}</h2>
                <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {getTasksForDay(selectedDay).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No tasks scheduled for this day.</p>
                ) : (
                  getTasksForDay(selectedDay).map(task => (
                    <div key={task.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{task.title}</h4>
                        <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>Priority: {task.priority}</span>
                        <span>{task.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button className="btn" onClick={openAddTaskForSelectedDay} style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Add Task
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-panel card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
              <h2 style={{ marginBottom: '1.5rem' }}>Add New Task</h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Task Title</label>
                  <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} placeholder="e.g. DBMS Assignment" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Deadline</label>
                    <input type="text" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Priority</label>
                    <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <button type="submit" onClick={handleAddTask} className="btn" style={{ marginTop: '1rem', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                  Create Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
