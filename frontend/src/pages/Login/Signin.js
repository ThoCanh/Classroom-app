import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signin.css';

function Signin() {
  const [soDienThoai, setSoDienThoai] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
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

    // Chuyển trực tiếp đến dashboard
    navigate('/student/Dbstudent');
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
        <button className="nut-tieptuc" onClick={handleNext}>
          Next
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
