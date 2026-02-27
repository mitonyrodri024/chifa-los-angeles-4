export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  role: 'user' | 'admin';
  address?: string;
  city?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}