import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, clearRecaptcha } from '../../firebase';
import { authAPI } from '../../services/api';
import './Login.css';

function Signin() {
  const [step, setStep] = useState(1); // 1: phone, 2: OTP
  const [soDienThoai, setSoDienThoai] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle next: send OTP and go to step 2
  const handleNext = async () => {
    if (!soDienThoai.trim()) {  
      setError('Please enter your phone number');
      return;
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(soDienThoai.replace(/\D/g, ''))) {
      setError('Invalid phone number');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await sendOTP(soDienThoai);
      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep(2);
      } else {
        setError(result.error || 'Could not send OTP');
        if (result.error && result.error.includes('billing')) {
          setError('Firebase Phone Authentication requires billing enabled. For testing, use test number: +1 650-555-3434 with OTP: 123456');
        }
      }
    } catch (error) {
      setError('Error sending OTP: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    if (!confirmationResult) {
      setError('No verification info found');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await verifyOTP(confirmationResult, otp);
      if (result.success) {
        const formattedPhone = soDienThoai.startsWith('0')
          ? `+84${soDienThoai.substring(1)}`
          : `+84${soDienThoai}`;
        const response = await authAPI.verifyOTP({
          phoneNumber: formattedPhone,
          idToken: result.idToken
        });
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if (response.data.user.role === 'instructor') {
            navigate('/teacher/instructor-dashboard');
          } else {
            navigate('/student/student-dashboard');
          }
        } else {
          setError(response.data.error || 'Authentication error');
        }
      } else {
        setError(result.error || 'Incorrect OTP');
      }
    } catch (error) {
      setError('Verification error: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to phone input
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
      setConfirmationResult(null);
      clearRecaptcha();
    }
    setError('');
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setConfirmationResult(null);
    await handleNext();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 340,
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '32px 24px 24px 24px',
        margin: '40px auto',
        textAlign: 'center'
      }}>
         {step === 1 && (
           <>
             <div style={{ textAlign: 'left', marginBottom: 20 }}>
               <button
                 style={{
                   background: 'none',
                   border: 'none',
                   color: '#333',
                   fontSize: 15,
                   cursor: 'pointer',
                   padding: 0,
                   display: 'flex',
                   alignItems: 'center',
                   opacity: 0.7
                 }}
                 onClick={() => window.history.back()}
               >
                 <span style={{ fontSize: 18, marginRight: 6 }}>←</span> Back
               </button>
             </div>
             <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 12, color: '#1a1a1a' }}>Sign In</h2>
             <div style={{ color: '#7a8599', fontSize: 15, marginBottom: 28, lineHeight: 1.4 }}>
               Please enter your phone to sign in
             </div>
            {error && (
              <div style={{
                background: '#fff5f5',
                border: '1px solid #fed7d7',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                color: '#c53030',
                fontSize: 14
              }}>
                {error}
              </div>
            )}
             <input
               type="tel"
               value={soDienThoai}
               onChange={e => {
                 const value = e.target.value.replace(/\D/g, '');
                 setSoDienThoai(value);
               }}
               placeholder="Your Phone Number"
               style={{
                 width: '100%',
                 padding: '14px 16px',
                 fontSize: 16,
                 border: '1.5px solid #e0e6ed',
                 borderRadius: 8,
                 marginBottom: 20,
                 outline: 'none',
                 backgroundColor: '#fafdff',
                 transition: 'border-color 0.2s, box-shadow 0.2s'
               }}
               onFocus={(e) => {
                 e.target.style.borderColor = '#007bff';
                 e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.10)';
                 e.target.style.backgroundColor = '#fff';
               }}
               onBlur={(e) => {
                 e.target.style.borderColor = '#e0e6ed';
                 e.target.style.boxShadow = 'none';
                 e.target.style.backgroundColor = '#fafdff';
               }}
               maxLength={11}
               inputMode="numeric"
               pattern="[0-9]*"
               disabled={isLoading}
             />
            <button
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '15px 0',
                fontWeight: 600,
                fontSize: 17,
                cursor: isLoading || !soDienThoai.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !soDienThoai.trim() ? 0.6 : 1,
                marginBottom: 22,
                boxShadow: '0 2px 8px rgba(0,123,255,0.07)',
                letterSpacing: '0.5px',
                transition: 'background 0.2s, box-shadow 0.2s'
              }}
              onClick={handleNext}
              disabled={isLoading || !soDienThoai.trim()}
              onMouseEnter={(e) => {
                if (!isLoading && soDienThoai.trim()) {
                  e.target.style.background = 'linear-gradient(90deg, #0056b3 60%, #007bff 100%)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,123,255,0.13)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && soDienThoai.trim()) {
                  e.target.style.background = 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,123,255,0.07)';
                }
              }}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
            <div style={{ fontSize: 13.5, color: '#7a8599', marginBottom: 28, lineHeight: 1.5 }}>
              passwordless authentication methods.
            </div>
            <div style={{ fontSize: 14, color: '#7a8599' }}>
              Don't having account?{' '}
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#007bff', 
                  textDecoration: 'none', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 14
                }}
                onClick={() => console.log('Navigate to sign up')}
              >
                Sign up
              </button>
            </div>
            <div id="recaptcha-container"></div>
          </>
        )}
         {step === 2 && (
           <>
             <div style={{ textAlign: 'left', marginBottom: 20 }}>
               <button
                 style={{
                   background: 'none',
                   border: 'none',
                   color: '#333',
                   fontSize: 15,
                   cursor: 'pointer',
                   padding: 0,
                   display: 'flex',
                   alignItems: 'center',
                   opacity: 0.7
                 }}
                 onClick={handleBack}
                 disabled={isLoading}
               >
                 <span style={{ fontSize: 18, marginRight: 6 }}>←</span> Back
               </button>
             </div>
             <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 12, color: '#1a1a1a' }}>Verify Phone</h2>
             <div style={{ color: '#7a8599', fontSize: 15, marginBottom: 28, lineHeight: 1.4 }}>
               Please enter the 6-digit code sent to <b>{soDienThoai}</b>
             </div>
            {error && (
              <div style={{
                background: '#fff5f5',
                border: '1px solid #fed7d7',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                color: '#c53030',
                fontSize: 14
              }}>
                {error}
              </div>
            )}
             <input
               type="text"
               value={otp}
               onChange={e => {
                 const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                 setOtp(value);
               }}
               placeholder="Enter OTP"
               style={{
                 width: '100%',
                 padding: '14px 16px',
                 fontSize: 18,
                 border: '1.5px solid #e0e6ed',
                 borderRadius: 8,
                 marginBottom: 20,
                 textAlign: 'center',
                 letterSpacing: 2,
                 fontWeight: 600,
                 backgroundColor: '#fafdff',
                 transition: 'border-color 0.2s, box-shadow 0.2s'
               }}
               onFocus={(e) => {
                 e.target.style.borderColor = '#007bff';
                 e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.10)';
                 e.target.style.backgroundColor = '#fff';
               }}
               onBlur={(e) => {
                 e.target.style.borderColor = '#e0e6ed';
                 e.target.style.boxShadow = 'none';
                 e.target.style.backgroundColor = '#fafdff';
               }}
               maxLength={6}
               inputMode="numeric"
               pattern="[0-9]*"
               disabled={isLoading}
             />
            <button
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '15px 0',
                fontWeight: 600,
                fontSize: 17,
                cursor: isLoading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                opacity: isLoading || otp.length !== 6 ? 0.6 : 1,
                marginBottom: 22,
                boxShadow: '0 2px 8px rgba(0,123,255,0.07)',
                letterSpacing: '0.5px',
                transition: 'background 0.2s, box-shadow 0.2s'
              }}
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              onMouseEnter={(e) => {
                if (!isLoading && otp.length === 6) {
                  e.target.style.background = 'linear-gradient(90deg, #0056b3 60%, #007bff 100%)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,123,255,0.13)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && otp.length === 6) {
                  e.target.style.background = 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,123,255,0.07)';
                }
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
            <div style={{ fontSize: 13.5, color: '#7a8599', marginBottom: 8, lineHeight: 1.5 }}>
              Didn't receive the code?{' '}
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  textDecoration: 'underline',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: 13.5,
                  fontWeight: 500,
                  padding: 0
                }}
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Signin;
