import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser,
  updateUserProfile 
} from '@/lib/firebase/auth';

export const authService = {
  async login(email: string, password: string) {
    return await loginWithEmail(email, password);
  },

  async register(email: string, password: string, displayName: string) {
    return await registerWithEmail(email, password, displayName);
  },

  async loginWithGoogle() {
    return await loginWithGoogle();
  },

  async logout() {
    return await logoutUser();
  },

  async updateProfile(uid: string, updates: any) {
    return await updateUserProfile(uid, updates);
  }
};