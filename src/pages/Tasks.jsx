import React, { useState, useEffect } from 'react';
import '../index.css';
import { Plus, Trash2, CheckCircle, X, LayoutList, Columns } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { onSnapshot } from 'firebase/firestore';
import { addTask, updateTaskStatus, deleteTask, getTasksQuery } from '../firebase/tasks';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('board'); // 'list' or 'board'
  
  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    priority: 'Medium',
    time: '',
    category: 'General'
  });

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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !newTask.title) return;

    try {
      await addTask(auth.currentUser.uid, newTask);
      setIsModalOpen(false);
      setNewTask({ title: '', deadline: '', priority: 'Medium', time: '', category: 'General' });
    } catch (error) {
      console.error("Error adding task", error);
      alert("Error creating task: " + error.message);
    }
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    if (!auth.currentUser) return;
    const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await updateTaskStatus(auth.currentUser.uid, taskId, newStatus);
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    if (!auth.currentUser) return;
    try {
      await updateTaskStatus(auth.currentUser.uid, taskId, newStatus);
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!auth.currentUser) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(auth.currentUser.uid, taskId);
      } catch (error) {
        console.error("Error deleting task", error);
      }
    }
  };

  // Drag and Drop Handlers for Kanban
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      handleUpdateStatus(taskId, status);
    }
  };

  const renderKanbanColumn = (status, title) => {
    const columnTasks = tasks.filter(t => t.status === status);
    return (
      <div 
        className="glass-panel" 
        style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', padding: '1rem', height: '100%' }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
          {title} <span>{columnTasks.length}</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
          {columnTasks.map(task => (
            <motion.div 
              layout
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', 
                borderLeft: `4px solid ${task.priority === 'High' ? '#ff4d4d' : task.priority === 'Medium' ? '#ffa500' : '#4ade80'}`,
                cursor: 'grab', opacity: task.status === 'Completed' ? 0.6 : 1
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98, cursor: 'grabbing' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>{task.title}</h4>
                <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{task.deadline || 'No date'}</span>
                <span>{task.time || '-'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="tasks-container" style={{ position: 'relative', minHeight: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your workload effectively.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.25rem' }}>
            <button 
              onClick={() => setViewMode('list')} 
              style={{ background: viewMode === 'list' ? 'var(--accent-purple)' : 'transparent', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
              title="List View"
            ><LayoutList size={20} /></button>
            <button 
              onClick={() => setViewMode('board')} 
              style={{ background: viewMode === 'board' ? 'var(--accent-purple)' : 'transparent', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
              title="Board View"
            ><Columns size={20} /></button>
          </div>
          <button className="btn" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Add Task
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>No tasks yet!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Click "Add Task" to get started.</p>
        </div>
      ) : viewMode === 'board' ? (
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
          {renderKanbanColumn('Not Started', 'Not Started')}
          {renderKanbanColumn('In Progress', 'In Progress')}
          {renderKanbanColumn('Completed', 'Completed')}
        </div>
      ) : (
        <div className="glass-panel card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: '500' }}>Task</th>
                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: '500' }}>Deadline</th>
                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: '500' }}>Priority</th>
                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: '500' }}>Time</th>
                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: '500' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '1.25rem 1.5rem', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', opacity: task.status === 'Completed' ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '500', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>{task.title}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{task.deadline || '-'}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: task.priority === 'High' ? '#ff4d4d' : task.priority === 'Medium' ? '#ffa500' : '#4ade80' }}>{task.priority}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{task.time || '-'}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', background: task.status === 'In Progress' ? 'rgba(157, 78, 221, 0.2)' : task.status === 'Completed' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: task.status === 'In Progress' ? 'var(--accent-purple-light)' : task.status === 'Completed' ? '#4ade80' : 'var(--text-secondary)' }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button onClick={() => handleToggleStatus(task.id, task.status)} style={{ background: 'none', border: 'none', color: task.status === 'Completed' ? '#4ade80' : 'var(--text-secondary)', cursor: 'pointer' }} title={task.status === 'Completed' ? "Mark Incomplete" : "Mark Complete"}><CheckCircle size={20} /></button>
                    <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Task Title</label>
                  <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} placeholder="e.g. DBMS Assignment" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Deadline</label>
                    <input type="text" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} placeholder="e.g. May 14, 9:00 AM" />
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estimated Time</label>
                    <input type="text" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} placeholder="e.g. 2h 30m" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category</label>
                    <input type="text" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} placeholder="e.g. Academic" />
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
