import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendEmailVerification,
  User,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Registro con email
export const registerWithEmail = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });
    await sendEmailVerification(user);

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: '',
      phoneNumber: '',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      role: 'user',
      address: '',
      city: ''
    });

    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.code === 'auth/email-already-in-use' 
        ? 'Este email ya está registrado' 
        : 'Error al registrar usuario'
    };
  }
};

// Login con email
export const loginWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      return { 
        success: false, 
        error: 'Por favor verifica tu email antes de iniciar sesión' 
      };
    }

    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.code === 'auth/invalid-credential'
        ? 'Email o contraseña incorrectos'
        : 'Error al iniciar sesión'
    };
  }
};

// Login con Google
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        emailVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        role: 'user',
        address: '',
        city: ''
      });
    }

    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: 'Error al iniciar sesión con Google' 
    };
  }
};

// Logout
export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Actualizar perfil
export const updateUserProfile = async (
  uid: string, 
  updates: any
): Promise<AuthResult> => {
  try {
    const user = auth.currentUser;
    
    // Actualizar en Auth si es el usuario actual
    if (user && user.uid === uid) {
      if (updates.displayName) {
        await updateProfile(user, { displayName: updates.displayName });
      }
    }

    // Actualizar en Firestore
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: 'Error al actualizar perfil' 
    };
  }
};

// Obtener usuario actual
export const getCurrentUser = () => {
  return auth.currentUser;
};