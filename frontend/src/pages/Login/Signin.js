import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signin.css';

function Signin() {
  const [soDienThoai, setSoDienThoai] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  console.log('Signin component is rendering...');

  const handleNext = async () => {
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

    setIsLoading(true);

    try {
      // Simple navigation without Firebase for now
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
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      alert('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    console.log('Chuyển đến trang đăng ký');
    // Xử lý chuyển hướng đến đăng ký
  };

  return (
    <div className="dangnhap-boc">
      <div className="dangnhap-the">
        {/* Nút quay lại */}
        <div className="quaylai-khuvuc">
          <span className="mui-ten-quaylai">←</span>
          <span className="chu-quaylai">Back</span>
        </div>

        {/* Tiêu đề */}
        <h1 className="dangnhap-tieude">Singn In</h1>

        {/* Hướng dẫn */}
        <p className="dangnhap-huongdan">
          Please enter your phone number to sign in
        </p>

        {/* Nhập số điện thoại */}
        <div className="nhap-khuvuc">
          <input
            type="tel"
            className="nhap-sodienthoai"
            placeholder="Your Phone Number"
            value={soDienThoai}
            onChange={(e) => {
              // Chỉ cho phép nhập số
              const value = e.target.value.replace(/\D/g, '');
              setSoDienThoai(value);
            }}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>

        {/* Nút tiếp tục */}
        <button 
          className="nut-tieptuc" 
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Next'}
        </button>

        {/* Thông tin phụ */}
        <p className="thongtin-phu">
          Passwordless authentication methods.
        </p>

        {/* Đăng ký */}
        <div className="dangky-khuvuc">
          <span className="cauhoi-dangky">Dont having account?</span>
          <span className="dangky-link" onClick={handleSignUp}>
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signin;
