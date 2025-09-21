import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Signin from './pages/Login/Signin';
import StudentDashboard from './pages/student/StudentDashboard';
import InstructorDashboard from './pages/teacher/InstructorDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/student/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/instructor-dashboard" element={<InstructorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;