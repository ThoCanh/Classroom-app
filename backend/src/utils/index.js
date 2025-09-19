// Utility functions
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const hashPassword = (password) => {
  // Password hashing - Coming soon
  return password;
};

module.exports = {
  generateId,
  formatDate,
  validateEmail,
  hashPassword
};
