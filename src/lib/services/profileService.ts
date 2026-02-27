import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/types/user.types';

export const profileService = {
  async getProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as User : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async updateProfile(uid: string, updates: Partial<User>) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Error al actualizar perfil' };
    }
  }
};