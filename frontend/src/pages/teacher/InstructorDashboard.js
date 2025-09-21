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
  const [conversations, setConversations] = useState([]);
  
  // Debug: Log selectedStudent state changes
  useEffect(() => {
    console.log('=== SELECTED STUDENT STATE CHANGED ===');
    console.log('Selected student:', selectedStudent);
    console.log('Selected student ID:', selectedStudent?.id);
    console.log('Selected student name:', selectedStudent?.name);
  }, [selectedStudent]);

  // Auto-refresh students every 30 seconds to get new students and update last message times
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('=== AUTO-REFRESHING STUDENTS ===');
      loadStudents();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);
  
  // Form states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Loading states
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    console.log('=== INSTRUCTOR DASHBOARD INITIALIZATION ===');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (!token || !userData) {
      console.log('❌ Missing token or user data, redirecting to signin');
      navigate('/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);
      console.log('User role:', parsedUser.role);
      console.log('User ID:', parsedUser.id);
      
      if (parsedUser.role !== 'instructor') {
        console.log('❌ User is not instructor, redirecting to signin');
        navigate('/signin');
        return;
      }
      
      console.log('✅ User is instructor, setting user and loading data');
      setUser(parsedUser);
      loadInitialData();
      
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/signin');
    }
    
    setIsLoading(false);
    
  }, [navigate]);

  const loadInitialData = async () => {
    console.log('=== LOADING INITIAL DATA ===');
    console.log('User data:', user);
    console.log('User ID:', user?.id);
    
    try {
      await Promise.all([
        loadStudents(),
        loadLessons()
      ]);
      console.log('✅ Initial data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    }
  };

  const createConversations = () => {
    console.log('=== CREATE CONVERSATIONS ===');
    console.log('createConversations called with students:', students);
    console.log('Students length:', students.length);
    
    if (!students || students.length === 0) {
      console.log('⚠️ NO STUDENTS AVAILABLE - Setting empty conversations');
      console.log('This is why the chat shows "Chưa có cuộc trò chuyện nào"');
      setConversations([]);
      return;
    }
    
    const convs = students.map(student => {
      let lastMessage = 'Chưa có tin nhắn';
      if (student.lastMessageTime) {
        const lastTime = new Date(student.lastMessageTime);
        const now = new Date();
        const diffMs = now - lastTime;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) {
          lastMessage = 'Vừa xong';
        } else if (diffMins < 60) {
          lastMessage = `${diffMins} phút trước`;
        } else if (diffHours < 24) {
          lastMessage = `${diffHours} giờ trước`;
        } else if (diffDays < 7) {
          lastMessage = `${diffDays} ngày trước`;
        } else {
          lastMessage = lastTime.toLocaleDateString('vi-VN');
        }
      }
      
      return {
        id: student.id,
        name: student.name,
        phone: student.phoneNumber,
        email: student.email,
        lastMessage: lastMessage,
        lastMessageTime: student.lastMessageTime
      };
    });
    
    // Debug: Log để kiểm tra dữ liệu
    console.log('Students data:', students);
    console.log('Conversations created:', convs);
    console.log('✅ Conversations will be displayed in chat');
    
    setConversations(convs);
  };

  const loadStudents = async () => {
    try {
      console.log('=== LOADING STUDENTS ===');
      setIsLoadingStudents(true);
      const response = await instructorAPI.getStudents();
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        console.log('Students from API:', response.data.students);
        console.log('Number of students:', response.data.students.length);
        
        if (response.data.students.length === 0) {
          console.log('⚠️ NO STUDENTS FOUND - This is why chat is empty');
          console.log('Please add students first using the "Thêm học sinh" button');
        }
        
        setStudents(response.data.students);
        console.log('About to call createConversations');
        createConversations();
      } else {
        console.error('API returned success: false');
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const loadLessons = async () => {
    try {
      setIsLoadingLessons(true);
      const response = await instructorAPI.getLessons();
      if (response.data.success) {
        setLessons(response.data.lessons);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const loadMessages = async (studentId) => {
    try {
      console.log('=== LOADING MESSAGES ===');
      console.log('Loading messages for student:', studentId);
      setIsLoadingMessages(true);
      
      // Clear previous messages
      setMessages([]);
      console.log('Messages cleared');
      
      // TODO: Implement message loading logic here
      console.log('Message loading not implemented yet');
      
      // Set timeout để đảm bảo loading được tắt
      setTimeout(() => {
        console.log('Timeout: Setting isLoadingMessages to false');
        setIsLoadingMessages(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsLoadingMessages(false);
    }
  };

  // Student management
  const handleAddStudent = async (studentData) => {
    try {
      const response = await instructorAPI.addStudent(studentData);
      if (response.data.success) {
        setShowStudentForm(false);
        console.log('Student added successfully, reloading students...');
        await loadStudents(); // ✅ Reload students after adding
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
        loadStudents();
        alert('Cập nhật học sinh thành công!');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Lỗi khi cập nhật học sinh: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      try {
        const response = await instructorAPI.deleteStudent(studentId);
        if (response.data.success) {
          loadStudents();
          alert('Xóa học sinh thành công!');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Lỗi khi xóa học sinh: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // Lesson management
  const handleCreateLesson = async (lessonData) => {
    try {
      const response = await instructorAPI.createLesson(lessonData);
      if (response.data.success) {
        setShowLessonForm(false);
        loadLessons();
        alert('Tạo bài học thành công!');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Lỗi khi tạo bài học: ' + (error.response?.data?.error || error.message));
    }
  };

  // Chat management
  const handleSendMessage = (messageData) => {
    try {
      console.log('=== INSTRUCTOR DASHBOARD HANDLE SEND MESSAGE ===');
      console.log('Message data:', messageData);
      console.log('Selected student:', selectedStudent);
      
      // TODO: Implement message sending logic here
      console.log('Message sending not implemented yet');
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReceiveMessage = (message) => {
    console.log('=== INSTRUCTOR DASHBOARD RECEIVED MESSAGE ===');
    console.log('Received message:', message);
    console.log('Current messages:', messages);
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('Updated messages:', newMessages);
      return newMessages;
    });
    
    // Refresh conversations to update last message time
    setTimeout(() => {
      console.log('Refreshing conversations after message received');
      loadStudents();
    }, 1000);
  };

  const handleMessageSent = (message) => {
    console.log('=== INSTRUCTOR DASHBOARD MESSAGE SENT CONFIRMATION ===');
    console.log('Message sent confirmation:', message);
    console.log('Current messages:', messages);
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('Updated messages after sent confirmation:', newMessages);
      return newMessages;
    });
    
    // Refresh conversations to update last message time
    setTimeout(() => {
      console.log('Refreshing conversations after message sent');
      loadStudents();
    }, 1000);
  };

  const handleSelectConversation = (conversation) => {
    const student = students.find(s => s.id === conversation.id);
    if (student) {
      setSelectedStudent(student);
      loadMessages(student.id);
    }
  };

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
                                console.log('Current conversations:', conversations);
                                console.log('Current selectedStudent:', selectedStudent);
                                
                                setSelectedStudent(student);
                                setActiveTab('chat');
                                loadMessages(student.id);
                                
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
                isLoading={isLoadingMessages}
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
                selectedConversation={(() => {
                  const selectedConv = selectedStudent ? conversations.find(c => c.id === selectedStudent.id) : null;
                  console.log('=== CHATBOX RENDER DEBUG ===');
                  console.log('selectedStudent:', selectedStudent);
                  console.log('conversations:', conversations);
                  console.log('selectedConversation:', selectedConv);
                  console.log('messages:', messages);
                  console.log('isLoadingMessages:', isLoadingMessages);
                  return selectedConv;
                })()}
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
          onSubmit={handleCreateLesson}
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
