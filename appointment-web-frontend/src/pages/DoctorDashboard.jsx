import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, Settings } from 'lucide-react';
import DoctorAppointments from './Doctor/DoctorAppointments';
import DoctorAvailability from './Doctor/DoctorAvailability';
import DoctorProfile from './Doctor/DoctorProfile';

export default function DoctorDashboard() {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 mb-4">
          <div className="card sticky-top" style={{top: '70px'}}>
            <div className="card-body">
              <h5 className="card-title fw-bold">Doctor Menu</h5>
              <nav className="nav flex-column gap-2 mt-3">
                <Link
                  to="/doctor/appointments"
                  className={`nav-link d-flex align-items-center gap-2 ${
                    isActive('appointments') ? 'active fw-semibold text-primary btn-light' : ''
                  }`}
                >
                  <Calendar size={20} />
                  <span>My Appointments</span>
                </Link>
                <Link
                  to="/doctor/availability"
                  className={`nav-link d-flex align-items-center gap-2 ${
                    isActive('availability') ? 'active fw-semibold text-primary btn-light' : ''
                  }`}
                >
                  <Clock size={20} />
                  <span>Set Availability</span>
                </Link>
                <Link
                  to="/doctor/profile"
                  className={`nav-link d-flex align-items-center gap-2 ${
                    isActive('profile') ? 'active fw-semibold text-primary btn-light' : ''
                  }`}
                >
                  <Settings size={20} />
                  <span>My Profile</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <Routes>
            <Route path="/appointments/*" element={<DoctorAppointments />} />
            <Route path="/availability/*" element={<DoctorAvailability />} />
            <Route path="/profile/*" element={<DoctorProfile />} />
            <Route path="/" element={<DoctorAppointments />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
