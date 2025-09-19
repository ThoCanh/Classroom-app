// Database models
const User = {
  id: String,
  email: String,
  password: String,
  name: String,
  role: String, // 'student', 'teacher', 'admin'
  createdAt: Date,
  updatedAt: Date
};

const Classroom = {
  id: String,
  name: String,
  description: String,
  teacherId: String,
  students: [String], // Array of student IDs
  createdAt: Date,
  updatedAt: Date
};

const Assignment = {
  id: String,
  title: String,
  description: String,
  classroomId: String,
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
};

module.exports = {
  User,
  Classroom,
  Assignment
};
