import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authStorage } from './utils/helpers';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorProfileSetup from './pages/DoctorProfileSetup';
import NotFoundPage from './pages/NotFoundPage';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authStorage.clear();
    setUser(null);
  };

  const handleLogin = (userData) => {
    authStorage.setUser(userData);
    setUser(userData);
  };

  const handleUserUpdate = (userData) => {
    authStorage.setUser(userData);
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
        
        {/* Doctor routes - check if profile is completed by checking specialization */}
        <Route 
          path="/doctor/setup" 
          element={
            <PrivateRoute user={user} role="doctor">
              {user?.doctor?.specialization || user?.doctor?.specialization_id ? (
                <Navigate to="/doctor" />
              ) : (
                <DoctorProfileSetup />
              )}
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/doctor/*" 
          element={
            <PrivateRoute user={user} role="doctor">
              {!user?.doctor?.specialization && !user?.doctor?.specialization_id ? (
                <Navigate to="/doctor/setup" />
              ) : (
                <DoctorDashboard />
              )}
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/patient/*" 
          element={<PrivateRoute user={user} role="patient"><PatientDashboard /></PrivateRoute>} 
        />
        
        <Route 
          path="/" 
          element={
            user ? (
              // Route based on user role
              user.role === 'patient' ? (
                // Patients go directly to dashboard - no profile completion needed
                <Navigate to="/patient" />
              ) : user.role === 'doctor' ? (
                // Doctors need profile completion check
                (user.doctor?.specialization || user.doctor?.specialization_id) ? 
                  <Navigate to="/doctor" /> : 
                  <Navigate to="/doctor/setup" />
              ) : (
                <Navigate to="/login" />
              )
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
