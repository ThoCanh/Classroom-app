import React, { useState } from 'react';
import './FirebaseConfigGuide.css';

const FirebaseConfigGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rulesCopied, setRulesCopied] = useState(false);

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRules);
    setRulesCopied(true);
    setTimeout(() => setRulesCopied(false), 2000);
  };

  const steps = [
    {
      title: "Truy cập Firebase Console",
      description: "Mở trình duyệt và truy cập Firebase Console",
      action: "Mở Firebase Console",
      url: "https://console.firebase.google.com/",
      icon: "🌐"
    },
    {
      title: "Chọn Project",
      description: "Chọn project 'classroom-app-3ee5e' từ danh sách",
      action: "Chọn Project",
      icon: "📁"
    },
    {
      title: "Vào Firestore Database",
      description: "Nhấn vào 'Firestore Database' trong menu bên trái",
      action: "Vào Firestore",
      icon: "🗄️"
    },
    {
      title: "Cấu hình Rules",
      description: "Nhấn vào tab 'Rules' và thay thế nội dung hiện tại",
      action: "Mở Rules",
      icon: "⚙️"
    },
    {
      title: "Copy Rules Code",
      description: "Copy đoạn code rules bên dưới và paste vào Rules editor",
      action: "Copy Rules",
      icon: "📋"
    },
    {
      title: "Publish Rules",
      description: "Nhấn nút 'Publish' để lưu rules mới",
      action: "Publish",
      icon: "🚀"
    }
  ];

  return (
    <div className="firebase-config-overlay">
      <div className="firebase-config-modal">
        <div className="modal-header">
          <h2>🔧 Cấu hình Firebase Firestore</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="progress-bar">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`progress-step ${index + 1 <= currentStep ? 'active' : ''}`}
              />
            ))}
          </div>
          
          <div className="step-content">
            <div className="step-header">
              <span className="step-icon">{steps[currentStep - 1].icon}</span>
              <h3>{steps[currentStep - 1].title}</h3>
            </div>
            
            <p className="step-description">{steps[currentStep - 1].description}</p>
            
            {currentStep === 1 && (
              <a 
                href={steps[currentStep - 1].url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn primary"
              >
                {steps[currentStep - 1].action}
              </a>
            )}
            
            {currentStep === 4 && (
              <div className="rules-section">
                <h4>Firestore Rules Code:</h4>
                <div className="code-block">
                  <pre>{firestoreRules}</pre>
                  <button 
                    className={`copy-btn ${rulesCopied ? 'copied' : ''}`}
                    onClick={copyRules}
                  >
                    {rulesCopied ? '✅ Đã copy!' : '📋 Copy'}
                  </button>
                </div>
                <p className="warning">
                  ⚠️ <strong>Lưu ý:</strong> Rules này cho phép tất cả người dùng đọc/ghi dữ liệu. 
                  Chỉ sử dụng cho môi trường phát triển!
                </p>
              </div>
            )}
          </div>
          
          <div className="step-navigation">
            <button 
              className="nav-btn prev" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              ← Trước
            </button>
            
            <span className="step-counter">
              Bước {currentStep} / {steps.length}
            </span>
            
            <button 
              className="nav-btn next" 
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
            >
              Tiếp →
            </button>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="finish-btn" onClick={onClose}>
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseConfigGuide;
