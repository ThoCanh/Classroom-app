import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signin.css';

function SigninTest() {
  const [soDienThoai, setSoDienThoai] = useState('');
  const navigate = useNavigate();

  console.log('SigninTest component is rendering...');

  const handleNext = () => {
    console.log('HandleNext called with phone:', soDienThoai);
    
    if (!soDienThoai.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(soDienThoai.replace(/\D/g, ''))) {
      alert('Số điện thoại không hợp lệ');
      return;
    }

    // Simple navigation without Firebase
    if (soDienThoai === '0336499876') {
      localStorage.setItem('teacherPhone', soDienThoai);
      sessionStorage.setItem('teacherPhone', soDienThoai);
      localStorage.setItem('userRole', 'teacher');
      navigate('/teacher/DBinstructor');
    } else {
      localStorage.setItem('studentPhone', soDienThoai);
      localStorage.setItem('userRole', 'student');
      navigate('/student/Dbstudent');
    }
  };

  const handleSignUp = () => {
    console.log('Chuyển đến trang đăng ký');
  };

  return (
    <div className="trang-dang-nhap">
      <div className="container-dang-nhap">
        <div className="header-dang-nhap">
          <h1>Đăng nhập</h1>
          <p>Nhập số điện thoại để tiếp tục</p>
        </div>
        
        <div className="form-dang-nhap">
          <div className="input-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              placeholder="Nhập số điện thoại"
              maxLength="11"
            />
          </div>
          
          <button 
            className="nut-dang-nhap" 
            onClick={handleNext}
          >
            Đăng nhập
          </button>
          
          <div className="link-dang-ky">
            <span>Chưa có tài khoản? </span>
            <button className="link" onClick={handleSignUp}>
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SigninTest;
