export const APP_NAME = 'Chifa Los Angeles';
export const APP_DESCRIPTION = 'El mejor chifa de la ciudad';

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

export const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'Este email ya está registrado',
  'auth/invalid-credential': 'Email o contraseña incorrectos',
  'auth/weak-password': 'La contraseña es muy débil',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/network-request-failed': 'Error de conexión',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  'auth/popup-closed-by-user': 'Popup cerrado por el usuario'
};