import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DBinstructor.css';

const DBinstructor = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);

  console.log('DBinstructor component is rendering...');

  // Dữ liệu mẫu
  const getSampleData = () => [
    {
      id: '1',
      ten: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      lop: 'CNTT01',
      soDienThoai: '0123456789',
      trangThai: 'hoat-dong',
      ngayTao: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString()
    },
    {
      id: '2',
      ten: 'Trần Thị B',
      email: 'tranthib@example.com',
      lop: 'CNTT01',
      soDienThoai: '0987654321',
      trangThai: 'hoat-dong',
      ngayTao: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString()
    },
    {
      id: '3',
      ten: 'Lê Văn C',
      email: 'levanc@example.com',
      lop: 'CNTT02',
      soDienThoai: '0369123456',
      trangThai: 'bi-khoa',
      ngayTao: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString()
    }
  ];

  // Kiểm tra xác thực khi component mount
  useEffect(() => {
    const teacherPhone = localStorage.getItem('teacherPhone') || sessionStorage.getItem('teacherPhone');
    
    if (teacherPhone === '0336499876') {
      setIsAuthenticated(true);
      // Sử dụng dữ liệu mẫu
      setDanhSachSinhVien(getSampleData());
    } else {
      navigate('/signin');
    }
    setIsLoading(false);
  }, [navigate]);

  // Xử lý đăng xuất
  const handleSignOut = () => {
    localStorage.removeItem('teacherPhone');
    sessionStorage.removeItem('teacherPhone');
    localStorage.removeItem('userRole');
    navigate('/signin');
  };

  // Xử lý khóa/mở khóa sinh viên
  const handleKhoaSinhVien = (id) => {
    setDanhSachSinhVien(prev => 
      prev.map(sv => 
        sv.id === id 
          ? { ...sv, trangThai: sv.trangThai === 'hoat-dong' ? 'bi-khoa' : 'hoat-dong' }
          : sv
      )
    );
  };

  // Xử lý xóa sinh viên
  const handleXoaSinhVien = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      setDanhSachSinhVien(prev => prev.filter(sv => sv.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="trang-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="trang-khong-quyen">
        <div className="thong-bao-khong-quyen">
          <h2>❌ Không có quyền truy cập</h2>
          <p>Bạn cần đăng nhập với tài khoản giáo viên để truy cập trang này.</p>
          <button 
            className="nut-dang-nhap-lai"
            onClick={() => navigate('/signin')}
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-giao-vien">
      <div className="sidebar">
        <div className="logo">
          <h2>📚 Classroom App</h2>
        </div>
        <nav className="menu">
          <button className="menu-item active">👥 Quản lý sinh viên</button>
          <button className="menu-item">📝 Quản lý bài tập</button>
          <button className="menu-item">💬 Tin nhắn</button>
        </nav>
      </div>

      <div className="noi-dung-chinh">
        <div className="header">
          <h1>Dashboard Giáo viên</h1>
          <div className="header-right">
            <div className="user-info">
              <span className="user-phone">{localStorage.getItem('teacherPhone') || 'Giáo viên'}</span>
              <button 
                className="nut-dang-xuat"
                onClick={handleSignOut}
                title="Đăng xuất"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
        
        <div className="noi-dung">
          <div className="header-chuc-nang">
            <h2>👥 Quản lý sinh viên</h2>
            <div className="nut-chuc-nang">
              <button className="nut-them">➕ Thêm sinh viên</button>
              <button className="nut-tai-lai">🔄 Tải lại</button>
            </div>
          </div>

          <div className="bang-sinh-vien">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Lớp</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {danhSachSinhVien.map((sinhVien, index) => (
                  <tr key={sinhVien.id}>
                    <td>{index + 1}</td>
                    <td>{sinhVien.ten}</td>
                    <td>{sinhVien.email}</td>
                    <td>{sinhVien.lop}</td>
                    <td>{sinhVien.soDienThoai}</td>
                    <td>
                      <span className={`trang-thai ${sinhVien.trangThai}`}>
                        {sinhVien.trangThai === 'hoat-dong' ? '✅ Hoạt động' : '🔒 Bị khóa'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="nut-sua"
                        onClick={() => handleKhoaSinhVien(sinhVien.id)}
                        title={sinhVien.trangThai === 'hoat-dong' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {sinhVien.trangThai === 'hoat-dong' ? '🔒' : '🔓'}
                      </button>
                      <button 
                        className="nut-xoa"
                        onClick={() => handleXoaSinhVien(sinhVien.id)}
                        title="Xóa sinh viên"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBinstructor;