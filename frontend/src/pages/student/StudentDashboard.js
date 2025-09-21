import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import LessonList from '../../components/LessonList';
import StudentChatBox from '../../components/StudentChatBox';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Data states
  const [profile, setProfile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [instructorId, setInstructorId] = useState(null);
  const [instructorName, setInstructorName] = useState('');
  
  // Form states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  
  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'student') {
        navigate('/signin');
        return;
      }
      
      setUser(parsedUser);
      loadInitialData();
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/signin');
    }
    
    setIsLoading(false);
    
  }, [navigate]);

  const loadInitialData = async () => {
    await Promise.all([
      loadProfile(),
      loadLessons()
    ]);
  };

  const loadProfile = async () => {
    try {
      console.log('=== LOADING STUDENT PROFILE ===');
      setIsLoadingProfile(true);
      const response = await studentAPI.getProfile();
      console.log('Profile API response:', response.data);
      
      if (response.data.success) {
        console.log('Profile data:', response.data.profile);
        setProfile(response.data.profile);
        setInstructorId(response.data.profile.instructorId);
        console.log('Set instructorId:', response.data.profile.instructorId);
        
        // Set instructor name if available
        if (response.data.profile.instructorName) {
          setInstructorName(response.data.profile.instructorName);
          console.log('Set instructorName:', response.data.profile.instructorName);
        } else {
          setInstructorName('Instructor'); // Default name
          console.log('Set default instructorName: Instructor');
        }
        
        setProfileFormData({
          name: response.data.profile.name,
          email: response.data.profile.email,
          phoneNumber: response.data.profile.phoneNumber
        });
      } else {
        console.log('Profile API returned success: false');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadLessons = async () => {
    try {
      setIsLoadingLessons(true);
      const response = await studentAPI.getLessons();
      if (response.data.success) {
        setLessons(response.data.lessons);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const loadMessages = async () => {
    if (!instructorId) {
      console.log('❌ No instructorId, cannot load messages');
      return;
    }
    
    try {
      console.log('=== STUDENT LOADING MESSAGES ===');
      console.log('Loading messages for instructor:', instructorId);
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

  // Profile management
  const handleUpdateProfile = async () => {
    try {
      const response = await studentAPI.updateProfile(profileFormData);
      if (response.data.success) {
        setShowProfileForm(false);
        loadProfile();
        alert('Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Lỗi khi cập nhật hồ sơ: ' + (error.response?.data?.error || error.message));
    }
  };

  // Lesson management
  const handleCompleteLesson = async (lessonId) => {
    try {
      const response = await studentAPI.completeLesson(lessonId);
      if (response.data.success) {
        loadLessons();
        alert('Đánh dấu hoàn thành bài học thành công!');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Lỗi khi hoàn thành bài học: ' + (error.response?.data?.error || error.message));
    }
  };

  // Chat management
  const handleSendMessage = (messageData) => {
    console.log('=== STUDENT DASHBOARD HANDLE SEND MESSAGE ===');
    console.log('Message data:', messageData);
    console.log('Instructor ID:', instructorId);
    
    if (!instructorId) {
      console.log('ERROR: No instructor ID found');
      alert('Không tìm thấy thông tin giáo viên');
      return;
    }
    
    try {
      // TODO: Implement message sending logic here
      console.log('Message sending not implemented yet');
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReceiveMessage = (message) => {
    console.log('=== STUDENT DASHBOARD RECEIVED MESSAGE ===');
    console.log('Received message:', message);
    console.log('Current messages:', messages);
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('Updated messages:', newMessages);
      return newMessages;
    });
  };

  const handleMessageSent = (message) => {
    console.log('=== STUDENT DASHBOARD MESSAGE SENT CONFIRMATION ===');
    console.log('Message sent confirmation:', message);
    console.log('Current messages:', messages);
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('Updated messages after sent confirmation:', newMessages);
      return newMessages;
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  // Load messages when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat' && instructorId) {
      console.log('=== STUDENT DASHBOARD LOADING MESSAGES ===');
      console.log('activeTab:', activeTab);
      console.log('instructorId:', instructorId);
      loadMessages();
    }
  }, [activeTab, instructorId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="sidebar">
        <div className="logo">
          <h2>📚 Classroom App</h2>
        </div>
        
        <nav className="menu">
          <button 
            className={`menu-item ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            📚 Bài học của tôi
          </button>
          <button 
            className={`menu-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat với giáo viên
          </button>
          <button 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Hồ sơ cá nhân
          </button>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Dashboard Học sinh</h1>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{profile?.name || user?.name || 'Học sinh'}</span>
              <span className="user-email">{profile?.email}</span>
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
          {activeTab === 'lessons' && (
            <div className="lessons-section">
              <div className="section-header">
                <h2>📚 Bài học của tôi</h2>
                <div className="section-actions">
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
                userRole="student"
                onCompleteLesson={handleCompleteLesson}
                isLoading={isLoadingLessons}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="chat-section">
              {console.log('=== STUDENT DASHBOARD CHAT SECTION ===')}
              {console.log('activeTab:', activeTab)}
              {console.log('instructorId:', instructorId)}
              {console.log('instructorName:', instructorName)}
              {console.log('messages:', messages)}
              {console.log('isLoadingMessages:', isLoadingMessages)}
              
              <div className="section-header">
                <h2>💬 Chat với giáo viên</h2>
                {instructorId && (
                  <div className="chat-info">
                    <span>Đang chat với giáo viên</span>
                  </div>
                )}
              </div>

              {instructorId ? (
                <>
                  {console.log('=== RENDERING STUDENT CHAT BOX ===')}
                  {console.log('instructorId exists:', !!instructorId)}
                  {console.log('instructorName:', instructorName)}
                  <StudentChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    currentUserId={user.id}
                    instructorId={instructorId}
                    instructorName={instructorName}
                    isLoading={isLoadingMessages}
                  />
                </>
              ) : (
                <>
                  {console.log('=== NO INSTRUCTOR ID ===')}
                  {console.log('instructorId:', instructorId)}
                  {console.log('profile:', profile)}
                  <div className="no-instructor">
                    <p>Chưa có thông tin giáo viên</p>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                      Vui lòng liên hệ quản trị viên để được assign giáo viên
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>👤 Hồ sơ cá nhân</h2>
                <div className="section-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowProfileForm(true)}
                  >
                    ✏️ Chỉnh sửa
                  </button>
                </div>
              </div>

              {isLoadingProfile ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Đang tải thông tin hồ sơ...</p>
                </div>
              ) : profile ? (
                <div className="profile-card">
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      {profile.name?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                  </div>
                  
                  <div className="profile-info">
                    <div className="info-group">
                      <label>Tên:</label>
                      <span>{profile.name}</span>
                    </div>
                    <div className="info-group">
                      <label>Email:</label>
                      <span>{profile.email}</span>
                    </div>
                    <div className="info-group">
                      <label>Số điện thoại:</label>
                      <span>{profile.phoneNumber}</span>
                    </div>
                    <div className="info-group">
                      <label>Tên đăng nhập:</label>
                      <span>{profile.username}</span>
                    </div>
                    <div className="info-group">
                      <label>Ngày tạo:</label>
                      <span>{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <p>Không tìm thấy thông tin hồ sơ</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Chỉnh sửa hồ sơ</h3>
              <button 
                className="close-btn"
                onClick={() => setShowProfileForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Tên:</label>
                <input
                  type="text"
                  value={profileFormData.name}
                  onChange={(e) => setProfileFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại:</label>
                <input
                  type="tel"
                  value={profileFormData.phoneNumber}
                  onChange={(e) => setProfileFormData(prev => ({
                    ...prev,
                    phoneNumber: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowProfileForm(false)}
              >
                Hủy
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateProfile}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
