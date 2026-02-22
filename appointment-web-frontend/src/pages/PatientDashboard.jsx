import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, Calendar, User } from 'lucide-react';
import PatientSearchDoctors from './Patient/PatientSearchDoctors';
import PatientMyAppointments from './Patient/PatientMyAppointments';
import PatientProfile from './Patient/PatientProfile';

export default function PatientDashboard() {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 mb-4">
          <div className="card sticky-top" style={{top: '70px'}}>
            <div className="card-body">
              <h5 className="card-title fw-bold">Patient Menu</h5>
              <nav className="nav flex-column gap-2 mt-3">
                <Link
                  to="/patient/search"
                  className={`nav-link d-flex align-items-center gap-2 ${
                    isActive('search') ? 'active fw-semibold text-primary btn-light' : ''
                  }`}
                >
                  <Search size={20} />
                  <span>Find Doctors</span>
                </Link>
                <Link
                  to="/patient/appointments"
                  className={`nav-link d-flex align-items-center gap-2 ${
                    isActive('appointments') ? 'active fw-semibold text-primary btn-light' : ''
                  }`}
                >
                  <Calendar size={20} />
                  <span>My Appointments</span>
                </Link>
                <Link
                  to="/patient/profile"
                  className={`nav-link d-flex align-items-center gap-2 ${
                    isActive('profile') ? 'active fw-semibold text-primary btn-light' : ''
                  }`}
                >
                  <User size={20} />
                  <span>My Profile</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <Routes>
            <Route path="/search/*" element={<PatientSearchDoctors />} />
            <Route path="/appointments/*" element={<PatientMyAppointments />} />
            <Route path="/profile/*" element={<PatientProfile />} />
            <Route path="/" element={<PatientSearchDoctors />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
