import React, { useState } from 'react';
import './Dbstudent.css';

const Dbstudent = () => {
  const [activeMenu, setActiveMenu] = useState('message');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Bạn có bài tập mới từ giáo viên', time: '10 phút trước' },
    { id: 2, message: 'Lớp học sẽ bắt đầu lúc 9:00', time: '1 giờ trước' }
  ]);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'manage-lessons':
        return (
          <div className="noi-dung-chinh">
            <h2>Quản lý bài học</h2>
            <div className="danh-sach-bai-hoc">
              <div className="bai-hoc-item">
                <h3>Toán học - Chương 1</h3>
                <p>Ngày: 15/12/2024</p>
                <p>Trạng thái: Chưa hoàn thành</p>
                <button className="nut-bat-dau">Bắt đầu học</button>
              </div>
              <div className="bai-hoc-item">
                <h3>Tiếng Anh - Unit 2</h3>
                <p>Ngày: 16/12/2024</p>
                <p>Trạng thái: Đã hoàn thành</p>
                <button className="nut-xem-lai">Xem lại</button>
              </div>
            </div>
          </div>
        );
      case 'message':
        return (
          <div className="noi-dung-chinh">
            <h2>Tin nhắn</h2>
            <div className="danh-sach-tin-nhan">
              <div className="tin-nhan-item">
                <div className="avatar-giao-vien"></div>
                <div className="thong-tin-tin-nhan">
                  <h4>Giáo viên Toán</h4>
                  <p>Chào em, bài tập về nhà đã được gửi...</p>
                  <span className="thoi-gian">2 giờ trước</span>
                </div>
              </div>
              <div className="tin-nhan-item">
                <div className="avatar-giao-vien"></div>
                <div className="thong-tin-tin-nhan">
                  <h4>Giáo viên Tiếng Anh</h4>
                  <p>Em nhớ làm bài tập Unit 2 nhé...</p>
                  <span className="thoi-gian">1 ngày trước</span>
                </div>
              </div>
            </div>
            <div className="khung-nhap-tin-nhan">
              <input type="text" placeholder="Nhập tin nhắn..." className="o-nhap-tin-nhan" />
              <button className="nut-gui">Gửi</button>
            </div>
          </div>
        );
      case 'tai-khoan':
        return (
          <div className="noi-dung-chinh">
            <h2>Thông tin tài khoản</h2>
            <div className="thong-tin-ca-nhan">
              <div className="avatar-lon"></div>
              <div className="chi-tiet-tai-khoan">
                <h3>Nguyễn Văn A</h3>
                <p>Lớp: 10A1</p>
                <p>Email: student@example.com</p>
                <p>Số điện thoại: 0123456789</p>
                <button className="nut-chinh-sua">Chỉnh sửa thông tin</button>
              </div>
            </div>
          </div>
        );
      case 'thong-bao':
        return (
          <div className="noi-dung-chinh">
            <h2>Thông báo</h2>
            <div className="danh-sach-thong-bao">
              {notifications.map(notification => (
                <div key={notification.id} className="thong-bao-item" onClick={() => markNotificationAsRead(notification.id)}>
                  <div className="icon-thong-bao">🔔</div>
                  <div className="noi-dung-thong-bao">
                    <p>{notification.message}</p>
                    <span className="thoi-gian">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="noi-dung-chinh">
            <h2>Chào mừng bạn đến với dashboard!</h2>
            <p>Chọn một mục từ menu bên trái để bắt đầu.</p>
          </div>
        );
    }
  };

  return (
    <div className="trang-dashboard">
      {/* Sidebar */}
      <div className="thanh-ben">
        <div className="logo">
          <h2>Classroom App</h2>
        </div>
        
        <nav className="menu-chinh">
          <div 
            className={`menu-item ${activeMenu === 'manage-lessons' ? 'active' : ''}`}
            onClick={() => handleMenuClick('manage-lessons')}
          >
            <span className="icon-menu">📚</span>
            <span>Manage Lessons</span>
          </div>
          
          <div 
            className={`menu-item ${activeMenu === 'message' ? 'active' : ''}`}
            onClick={() => handleMenuClick('message')}
          >
            <span className="icon-menu">💬</span>
            <span>Message</span>
          </div>
          
          <div 
            className={`menu-item ${activeMenu === 'tai-khoan' ? 'active' : ''}`}
            onClick={() => handleMenuClick('tai-khoan')}
          >
            <span className="icon-menu">👤</span>
            <span>Tài khoản</span>
          </div>
          
          <div 
            className={`menu-item ${activeMenu === 'thong-bao' ? 'active' : ''}`}
            onClick={() => handleMenuClick('thong-bao')}
          >
            <span className="icon-menu">🔔</span>
            <span>Thông báo</span>
            {notifications.length > 0 && (
              <span className="so-thong-bao">{notifications.length}</span>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="noi-dung-chinh">
        <div className="header">
          <h1>Dashboard Student</h1>
          <div className="header-right">
            <div className="thong-bao-header">
              <span className="icon-thong-bao">🔔</span>
              {notifications.length > 0 && (
                <span className="so-thong-bao-header">{notifications.length}</span>
              )}
            </div>
            <div className="avatar-header"></div>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default Dbstudent;
