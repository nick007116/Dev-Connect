import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

class ConversationManager {
  constructor() {
    this.unsubscribeCallbacks = new Map();
  }

  // Save a conversation to Firestore
  async saveConversation(userId, conversation) {
    try {
      const conversationRef = doc(db, 'conversations', conversation.id);
      const conversationData = {
        ...conversation,
        userId,
        updatedAt: serverTimestamp(),
        createdAt: conversation.createdAt ? new Date(conversation.createdAt) : serverTimestamp()
      };
      
      await setDoc(conversationRef, conversationData, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  // Load all conversations for a user
  async loadConversations(userId) {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const conversations = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate()?.toISOString() || data.updatedAt
        });
      });
      
      return conversations;
    } catch (error) {
      console.error('Error loading conversations:', error);
      throw error;
    }
  }

  // Subscribe to real-time conversation updates
  subscribeToConversations(userId, callback) {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const conversations = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          conversations.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate()?.toISOString() || data.updatedAt
          });
        });
        callback(conversations);
      }, (error) => {
        console.error('Error in conversation subscription:', error);
      });

      this.unsubscribeCallbacks.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to conversations:', error);
      throw error;
    }
  }

  // Unsubscribe from conversation updates
  unsubscribeFromConversations(userId) {
    const unsubscribe = this.unsubscribeCallbacks.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribeCallbacks.delete(userId);
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      await deleteDoc(doc(db, 'conversations', conversationId));
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Update conversation title
  async updateConversationTitle(conversationId, newTitle) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        title: newTitle,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  }

  // Get a specific conversation
  async getConversation(conversationId) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const docSnap = await getDoc(conversationRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate()?.toISOString() || data.updatedAt
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Clean up all subscriptions
  cleanup() {
    this.unsubscribeCallbacks.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribeCallbacks.clear();
  }
}

export const conversationManager = new ConversationManager();