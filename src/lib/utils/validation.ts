export const validateEmail = (email: string): string => {
  if (!email) return 'Email es requerido';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Email no válido';
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return 'Contraseña es requerida';
  if (password.length < 6) return 'Mínimo 6 caracteres';
  return '';
};

export const validateName = (name: string): string => {
  if (!name.trim()) return 'Nombre es requerido';
  if (name.length < 2) return 'Nombre muy corto';
  return '';
};

export const validatePhone = (phone: string): string => {
  if (phone && !/^[0-9+\-\s()]{10,}$/.test(phone)) {
    return 'Teléfono no válido';
  }
  return '';
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) return 'Confirma tu contraseña';
  if (password !== confirmPassword) return 'Las contraseñas no coinciden';
  return '';
};