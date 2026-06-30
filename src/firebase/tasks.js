import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

/**
 * Adds a new task to Firestore for a specific user.
 */
export const addTask = async (userId, taskData) => {
  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: serverTimestamp(),
      status: taskData.status || 'Not Started'
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding task: ", error);
    throw error;
  }
};

/**
 * Updates the status of an existing task.
 */
export const updateTaskStatus = async (userId, taskId, newStatus) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating task status: ", error);
    throw error;
  }
};

/**
 * Deletes a task from Firestore.
 */
export const deleteTask = async (userId, taskId) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task: ", error);
    throw error;
  }
};

/**
 * Helper function to create a query for a user's tasks, ordered by creation date.
 */
export const getTasksQuery = (userId) => {
  return query(collection(db, 'users', userId, 'tasks'), orderBy('createdAt', 'desc'));
};
