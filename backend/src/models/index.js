// Database models
const User = {
  id: String,
  phoneNumber: String,
  email: String,
  password: String,
  name: String,
  role: String, // 'student', 'instructor'
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
};

const Student = {
  id: String,
  name: String,
  email: String,
  phoneNumber: String,
  username: String,
  password: String,
  instructorId: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
};

const Lesson = {
  id: String,
  title: String,
  description: String,
  instructorId: String,
  studentIds: [String], // Array of student IDs
  isCompleted: Boolean,
  createdAt: Date,
  updatedAt: Date
};

const Message = {
  id: String,
  message: String,
  senderId: String,
  receiverId: String,
  senderRole: String, // 'instructor' or 'student'
  receiverRole: String,
  timestamp: Date,
  isRead: Boolean
};

const OTPVerification = {
  id: String,
  phoneNumber: String,
  otp: String,
  expiresAt: Date,
  isUsed: Boolean,
  createdAt: Date
};

module.exports = {
  User,
  Student,
  Lesson,
  Message,
  OTPVerification
};
