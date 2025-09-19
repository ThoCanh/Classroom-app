import React from 'react';

function SimpleApp() {
  console.log('SimpleApp is rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Classroom App - Test Version</h1>
      <p>Nếu bạn thấy trang này, có nghĩa là React app đang hoạt động!</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Navigation:</h2>
        <button 
          onClick={() => window.location.href = '/signin'}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Go to Signin
        </button>
        
        <button 
          onClick={() => {
            localStorage.setItem('teacherPhone', '0336499876');
            window.location.href = '/teacher/DBinstructor';
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Teacher Dashboard
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Debug Info:</h3>
        <p>Current URL: {window.location.href}</p>
        <p>LocalStorage teacherPhone: {localStorage.getItem('teacherPhone') || 'Not set'}</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>
    </div>
  );
}

export default SimpleApp;
