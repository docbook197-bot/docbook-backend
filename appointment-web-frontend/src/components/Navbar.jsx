import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { authAPI } from '../api/client';

export default function Navbar({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      onLogout();
      navigate('/login');
    }
  };

  const dashboardLink = user?.role === 'doctor' ? '/doctor' : '/patient';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <span className="fs-4 fw-bold text-primary">💉 MedBook</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <div className="ms-auto d-flex align-items-center gap-3">
            <Link to={dashboardLink} className="nav-link">
              Dashboard
            </Link>
            <span className="text-muted">{user?.name}</span>
            <span className="badge bg-primary">
              {user?.role === 'doctor' ? 'Doctor' : 'Patient'}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm d-flex align-items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
