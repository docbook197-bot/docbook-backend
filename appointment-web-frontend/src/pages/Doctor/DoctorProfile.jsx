import { useState, useEffect } from 'react';
import { Loader, User } from 'lucide-react';
import { authAPI } from '../../api/client';

export default function DoctorProfile() {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.me();
      setUser(response.data.user);
      setDoctor(response.data.doctor);
      setError('');
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Loader className="text-primary" size={40} style={{animation: 'spin 1s linear infinite'}} />
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
      <h1 className="h3 fw-bold text-dark mb-4">My Profile</h1>

      <div className="card shadow">
        <div className="card-body p-4">
          {/* Profile Header */}
          <div className="d-flex gap-4 pb-4 border-bottom">
            <div>
              {doctor?.profile_picture_url ? (
                <img
                  src={doctor.profile_picture_url}
                  alt="Profile"
                  className="rounded-circle"
                  style={{width: '80px', height: '80px', objectFit: 'cover', border: '3px solid #0d6efd'}}
                />
              ) : (
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <User size={48} className="text-muted" />
                </div>
              )}
            </div>

            <div className="flex-grow-1">
              <h2 className="h4 fw-bold text-dark mb-2">{user?.name}</h2>
              <p className="text-muted mb-2">{user?.email}</p>
              <p className="text-muted mb-3">📞 {user?.phone_number}</p>

              <div className="d-flex gap-2 flex-wrap">
                <div className="p-2 bg-light rounded">
                  <p className="text-muted mb-0 small">Specialization</p>
                  <p className="fw-semibold mb-0">{doctor?.specialization || 'Not set'}</p>
                </div>
                <div className="p-2 bg-light rounded">
                  <p className="text-muted mb-0 small">Hospital</p>
                  <p className="fw-semibold mb-0">{doctor?.hospital_name}</p>
                </div>
                <div className="p-2 bg-light rounded">
                  <p className="text-muted mb-0 small">Consultation Fee</p>
                  <p className="fw-semibold mb-0">${doctor?.consultation_fee || 'N/A'}</p>
                </div>
                <div className="p-2 bg-light rounded">
                  <p className="text-muted mb-0 small">Duration</p>
                  <p className="fw-semibold mb-0">{doctor?.consultation_duration} mins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-4">
            <h5 className="fw-bold text-dark mb-3">Professional Bio</h5>
            <p className="text-dark">
              {doctor?.bio || 'No bio added yet'}
            </p>
          </div>

          {/* Certificate Section */}
          {doctor?.certificate_url && (
            <div className="mt-4">
              <h5 className="fw-bold text-dark mb-3">Medical Certificate</h5>
              <a
                href={doctor.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Certificate
              </a>
            </div>
          )}

          {/* Account Info */}
          <div className="mt-4 p-3 bg-light rounded">
            <h5 className="fw-bold text-dark mb-3">Account Information</h5>
            <div className="row">
              <div className="col-md-6">
                <p className="text-muted small mb-1">Account Status</p>
                <p className="fw-semibold text-success">
                  {doctor?.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
                </p>
              </div>
              <div className="col-md-6">
                <p className="text-muted small mb-1">Member Since</p>
                <p className="fw-semibold text-dark">
                  {new Date(user?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
