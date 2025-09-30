export function getAuthErrorMessage(error: any): string {
  const message = error?.message || error || ''
  
  if (message.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos'
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Por favor, confirma tu email antes de iniciar sesión'
  }
  
  if (message.includes('User already registered')) {
    return 'Este email ya está registrado. Intenta iniciar sesión.'
  }
  
  if (message.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres'
  }
  
  if (message.includes('Invalid email')) {
    return 'Por favor, ingresa un email válido'
  }
  
  if (message.includes('Signup is disabled')) {
    return 'El registro está temporalmente deshabilitado'
  }
  
  // Return the original message if no specific case matches
  return message || 'Ocurrió un error inesperado'
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' }
  }
  
  if (password.length > 72) {
    return { isValid: false, message: 'La contraseña no puede tener más de 72 caracteres' }
  }
  
  return { isValid: true }
}

export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { isValid: false, message: 'El email es requerido' }
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Por favor, ingresa un email válido' }
  }
  
  return { isValid: true }
}