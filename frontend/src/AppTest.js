import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SigninTest from './pages/Login/SigninTest';

function AppTest() {
  console.log('AppTest component is rendering...');
  
  return (
    <Router>
      <div className="App">
        <h1>Test App - Working!</h1>
        <Routes>
          <Route path="/" element={<SigninTest />} />
          <Route path="/signin" element={<SigninTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default AppTest;
