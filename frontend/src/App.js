import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Signin from './pages/Login/Signin';
import Dbstudent from './pages/student/Dbstudent';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/student/Dbstudent" element={<Dbstudent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;