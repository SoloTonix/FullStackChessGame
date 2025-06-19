import React from 'react';
import { useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function App() {
  //<Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>} />
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>} />
        <Route path="/game/:gameId/" element={<ProtectedRoute><GamePage/></ProtectedRoute>} />
        <Route path="/game/login" element={<LoginPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
