import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';

/**
 * Adds a new goal to Firestore for a specific user.
 */
export const addGoal = async (userId, goalData) => {
  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const docRef = await addDoc(goalsRef, {
      ...goalData,
      createdAt: serverTimestamp(),
      status: 'Active',
      milestones: goalData.milestones || [] // Array of { id, title, isCompleted }
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding goal: ", error);
    throw error;
  }
};

/**
 * Deletes a goal from Firestore.
 */
export const deleteGoal = async (userId, goalId) => {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error("Error deleting goal: ", error);
    throw error;
  }
};

/**
 * Toggles a milestone's completion status within a goal.
 */
export const toggleMilestone = async (userId, goalId, milestoneId) => {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      const data = goalSnap.data();
      const updatedMilestones = data.milestones.map(m => 
        m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
      );
      
      await updateDoc(goalRef, {
        milestones: updatedMilestones,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error toggling milestone: ", error);
    throw error;
  }
};

/**
 * Helper function to create a query for a user's goals, ordered by creation date.
 */
export const getGoalsQuery = (userId) => {
  return query(collection(db, 'users', userId, 'goals'), orderBy('createdAt', 'desc'));
};
