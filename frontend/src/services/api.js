import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (phoneNumber) => api.post('/auth/send-otp', { phoneNumber }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  verifyToken: () => api.get('/auth/verify-token'),
};

// Instructor API
export const instructorAPI = {
  addStudent: (data) => api.post('/instructor/students', data),
  getStudents: () => api.get('/instructor/students'),
  updateStudent: (studentId, data) => api.put(`/instructor/students/${studentId}`, data),
  deleteStudent: (studentId) => api.delete(`/instructor/students/${studentId}`),
  createLesson: (data) => api.post('/instructor/lessons', data),
  getLessons: () => api.get('/instructor/lessons'),
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getLessons: () => api.get('/student/lessons'),
  completeLesson: (lessonId) => api.put(`/student/lessons/${lessonId}/complete`),
  getMessages: (instructorId) => api.get(`/student/messages/${instructorId}`),
  sendMessage: (data) => api.post('/student/messages', data),
};

export default api;
