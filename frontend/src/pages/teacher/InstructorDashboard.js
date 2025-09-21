import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instructorAPI } from '../../services/api';
import StudentForm from '../../components/StudentForm';
import LessonForm from '../../components/LessonForm';
import LessonList from '../../components/LessonList';
import ChatBox from '../../components/ChatBox';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  
  // Data states
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Loading states
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        navigate('/signin');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'instructor') {
          navigate('/signin');
          return;
        }

        setUser(parsedUser);
        
        // Load initial data
        await loadStudents();
        await loadLessons();
        
      } catch (error) {
        console.error('Error initializing app:', error);
        navigate('/signin');
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, [navigate]);

  // Load students
  const loadStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const response = await instructorAPI.getStudents();
      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Load lessons
  const loadLessons = async () => {
    try {
      setIsLoadingLessons(true);
      const response = await instructorAPI.getLessons();
      if (response.data.success) {
        setLessons(response.data.lessons || []);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Student management
  const handleAddStudent = async (studentData) => {
    try {
      const response = await instructorAPI.addStudent(studentData);
      if (response.data.success) {
        setShowStudentForm(false);
        await loadStudents();
        alert('Thêm học sinh thành công!');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Lỗi khi thêm học sinh: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      const response = await instructorAPI.updateStudent(editingStudent.id, studentData);
      if (response.data.success) {
        setShowStudentForm(false);
        setEditingStudent(null);
        await loadStudents();
        alert('Cập nhật học sinh thành công!');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Lỗi khi cập nhật học sinh: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
      try {
        const response = await instructorAPI.deleteStudent(studentId);
        if (response.data.success) {
          await loadStudents();
          if (selectedStudent && selectedStudent.id === studentId) {
            setSelectedStudent(null);
            setMessages([]);
          }
          alert('Xóa học sinh thành công!');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Lỗi khi xóa học sinh: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // Lesson management
  const handleAddLesson = async (lessonData) => {
    try {
      const response = await instructorAPI.addLesson(lessonData);
      if (response.data.success) {
        setShowLessonForm(false);
        await loadLessons();
        alert('Thêm bài học thành công!');
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      alert('Lỗi khi thêm bài học: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateLesson = async (lessonData) => {
    try {
      const response = await instructorAPI.updateLesson(editingLesson.id, lessonData);
      if (response.data.success) {
        setShowLessonForm(false);
        setEditingLesson(null);
        await loadLessons();
        alert('Cập nhật bài học thành công!');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Lỗi khi cập nhật bài học: ' + (error.response?.data?.error || error.message));
    }
  };





  // Chat management - placeholder (no socket)
  const handleSelectStudent = (student) => {
    console.log('=== STUDENT SELECTED (NO SOCKET) ===');
    console.log('Selected student:', student);
    setSelectedStudent(student);
    
    // Mock loading some messages (in real app, this would be from API/database)
    setMessages([]);
    
    // Show offline status
    alert('Chat offline - Socket.IO đã bị xóa. Chức năng chat không khả dụng.');
  };

  const handleSendMessage = (messageData) => {
    console.log('=== SEND MESSAGE (NO SOCKET) ===');
    console.log('Message data:', messageData);
    
    // For now, just add the message to local state
    const newMessage = {
      id: Date.now().toString(),
      message: messageData.message,
      senderId: messageData.senderId,
      senderName: user?.name || 'Giáo viên',
      senderRole: 'instructor',
      receiverId: messageData.receiverId,
      receiverRole: 'student',
      timestamp: new Date(),
      delivered: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    alert('Chat chưa được kết nối (Socket.IO đã bị xóa)');
  };




  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      <div className="sidebar">
        <div className="logo">
          <h2>📚 Classroom App</h2>
        </div>
        
        <nav className="menu">
          <button 
            className={`menu-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Quản lý học sinh
          </button>
          <button 
            className={`menu-item ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            📝 Quản lý bài học
          </button>
          <button 
            className={`menu-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Tin nhắn
          </button>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Dashboard Giáo viên</h1>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.name || 'Giáo viên'}</span>
              <span className="user-phone">{user?.phoneNumber}</span>
              <button 
                className="btn-signout"
                onClick={handleSignOut}
                title="Đăng xuất"
              >
                🚪
              </button>
            </div>
          </div>
        </div>

        <div className="content">
          {activeTab === 'students' && (
            <div className="students-section">
              <div className="section-header">
                <h2>👥 Quản lý học sinh</h2>
                <div className="section-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingStudent(null);
                      setShowStudentForm(true);
                    }}
                  >
                    ➕ Thêm học sinh
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={loadStudents}
                    disabled={isLoadingStudents}
                  >
                    🔄 Tải lại
                  </button>
                </div>
              </div>

              <div className="students-table">
                {isLoadingStudents ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách học sinh...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="no-data">
                    <p>Chưa có học sinh nào</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student.id}>
                          <td>{index + 1}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.phoneNumber}</td>
                          <td>
                            <span className={`status ${student.isActive ? 'active' : 'inactive'}`}>
                              {student.isActive ? '✅ Hoạt động' : '🔒 Bị khóa'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setEditingStudent(student);
                                setShowStudentForm(true);
                              }}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteStudent(student.id)}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                console.log('=== CHAT BUTTON CLICKED ===');
                                console.log('Student clicked:', student);
                                console.log('Current selectedStudent:', selectedStudent);
                                
                                handleSelectStudent(student);
                                setActiveTab('chat');
                                
                                console.log('After setting selectedStudent:', student);
                                console.log('After setting activeTab: chat');
                              }}
                              title="Chat"
                            >
                              💬
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="lessons-section">
              <div className="section-header">
                <h2>📝 Quản lý bài học</h2>
                <div className="section-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingLesson(null);
                      setShowLessonForm(true);
                    }}
                  >
                    ➕ Tạo bài học
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={loadLessons}
                    disabled={isLoadingLessons}
                  >
                    🔄 Tải lại
                  </button>
                </div>
              </div>

              <LessonList 
                lessons={lessons}
                userRole="instructor"
                isLoading={isLoadingLessons}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="chat-section">
              <div className="section-header">
                <h2>💬 Tin nhắn</h2>
                {selectedStudent && (
                  <div className="chat-info">
                    <span>Đang chat với: <strong>{selectedStudent.name}</strong></span>
                  </div>
                )}
              </div>

              <ChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId={user.id}
                receiverId={selectedStudent?.id}
                senderRole="instructor"
                receiverRole="student"
                isLoading={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showStudentForm && (
        <StudentForm
          onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
          onCancel={() => {
            setShowStudentForm(false);
            setEditingStudent(null);
          }}
          initialData={editingStudent}
        />
      )}

      {showLessonForm && (
        <LessonForm
          onSubmit={editingLesson ? handleUpdateLesson : handleAddLesson}
          onCancel={() => {
            setShowLessonForm(false);
            setEditingLesson(null);
          }}
          students={students}
          initialData={editingLesson}
        />
      )}
    </div>
  );
};

export default InstructorDashboard;