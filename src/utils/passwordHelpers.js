export const validatePassword = (password) => {
  if (!password) {
    return "Please enter a password";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  return "";
}; 