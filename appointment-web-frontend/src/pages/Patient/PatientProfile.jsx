import { useState, useEffect } from 'react';
import { Loader, User } from 'lucide-react';
import { authAPI } from '../../api/client';

export default function PatientProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.me();
      setUser(response.data.user);
      setError('');
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="display-5 fw-bold text-dark mb-4">My Profile</h1>

      <div className="card shadow-lg">
        <div className="card-body">
          {/* Profile Header */}
          <div className="d-flex gap-4 pb-4 border-bottom">
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{width: '120px', height: '120px', minWidth: '120px'}}>
              <User size={80} className="text-white" />
            </div>

            <div className="flex-grow-1">
              <h2 className="h3 fw-bold text-dark mb-2">{user?.name}</h2>
              <p className="text-muted mb-2">{user?.email}</p>
              <p className="text-muted mb-3">📞 {user?.phone_number}</p>

              <div className="d-flex gap-3 flex-wrap">
                <div className="bg-light p-3 rounded" style={{minWidth: '160px'}}>
                  <p className="small text-muted mb-1">User Type</p>
                  <p className="fw-semibold text-dark">Patient</p>
                </div>
                <div className="bg-light p-3 rounded" style={{minWidth: '160px'}}>
                  <p className="small text-muted mb-1">Account Status</p>
                  <p className="fw-semibold text-success">✓ Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-4 bg-light rounded p-4">
            <h5 className="fw-bold text-dark mb-3">Account Information</h5>
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <p className="small text-muted mb-1">Email Address</p>
                <p className="fw-semibold text-dark">{user?.email}</p>
              </div>
              <div className="col-12 col-md-6">
                <p className="small text-muted mb-1">Phone Number</p>
                <p className="fw-semibold text-dark">{user?.phone_number}</p>
              </div>
              <div className="col-12 col-md-6">
                <p className="small text-muted mb-1">Member Since</p>
                <p className="fw-semibold text-dark">
                  {new Date(user?.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="col-12 col-md-6">
                <p className="small text-muted mb-1">Account Verified</p>
                <p className="fw-semibold">
                  <span className="text-success">✓ Verified</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-4 row g-3">
            <div className="col-12 col-md-4">
              <div className="card border-primary h-100">
                <div className="card-body">
                  <p className="small text-muted mb-2">Quick Tip</p>
                  <p className="fw-semibold text-dark mb-2">Book appointments anytime</p>
                  <p className="small text-muted">Use the "Find Doctors" section to search and book your appointments</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card border-success h-100">
                <div className="card-body">
                  <p className="small text-muted mb-2">Quick Tip</p>
                  <p className="fw-semibold text-dark mb-2">Track your appointments</p>
                  <p className="small text-muted">View all your bookings and their status in "My Appointments"</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card border-info h-100">
                <div className="card-body">
                  <p className="small text-muted mb-2">Quick Tip</p>
                  <p className="fw-semibold text-dark mb-2">Reschedule anytime</p>
                  <p className="small text-muted">Change your appointment dates before they are approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
