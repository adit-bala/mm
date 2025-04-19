import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DossiersPage from './pages/DossiersPage';
import RoomPage from './pages/RoomPage';
import AdminPage from './pages/AdminPage';

function App() {
  // Initialize dark mode based on user preference or localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dossiers"
            element={
              <ProtectedRoute>
                <DossiersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/room/:code4"
            element={
              <ProtectedRoute>
                <RoomPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
