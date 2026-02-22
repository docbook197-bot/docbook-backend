import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { appointmentAPI } from '../../api/client';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('scheduled');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentAPI.getDoctorAppointments({
        status: selectedStatus,
        page: 1,
      });
      setAppointments(response.data.appointments.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    setActionLoading(prev => ({ ...prev, [appointmentId]: 'approve' }));
    try {
      await appointmentAPI.approve(appointmentId);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'approved' } : apt
        )
      );
    } catch (err) {
      alert('Failed to approve appointment');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  const handleReject = async (appointmentId) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    setActionLoading(prev => ({ ...prev, [appointmentId]: 'reject' }));
    try {
      await appointmentAPI.reject(appointmentId, { reason });
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'rejected' } : apt
        )
      );
    } catch (err) {
      alert('Failed to reject appointment');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  const handleComplete = async (appointmentId) => {
    const notes = prompt('Enter consultation notes:');
    if (notes === null) return;

    setActionLoading(prev => ({ ...prev, [appointmentId]: 'complete' }));
    try {
      await appointmentAPI.complete(appointmentId, { doctor_notes: notes });
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'completed' } : apt
        )
      );
    } catch (err) {
      alert('Failed to complete appointment');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  return (
    <div>
      <h1 className="h3 fw-bold text-dark mb-4">My Appointments</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        {['scheduled', 'approved', 'completed', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`btn ${
              selectedStatus === status ? 'btn-primary' : 'btn-outline-primary'
            } text-capitalize`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Loader className="text-primary" size={40} style={{animation: 'spin 1s linear infinite'}} />
        </div>
      ) : appointments.length === 0 ? (
        <div className="card text-center p-5">
          <Clock size={40} className="mx-auto text-muted mb-3" />
          <p className="text-muted">No appointments found</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {appointments.map(appointment => (
            <div key={appointment.id} className="card p-4">
              <div className="row mb-3">
                <div className="col-md-3">
                  <p className="text-muted small mb-1">Patient</p>
                  <p className="fw-semibold">{appointment.patient?.name}</p>
                  <p className="small text-muted">{appointment.patient?.email}</p>
                </div>
                <div className="col-md-3">
                  <p className="text-muted small mb-1">Date & Time</p>
                  <p className="fw-semibold">{formatDateTime(appointment.appointment_start)}</p>
                  <p className="small text-muted">{appointment.notes && `Notes: ${appointment.notes}`}</p>
                </div>
                <div className="col-md-3">
                  <p className="text-muted small mb-1">Status</p>
                  <span className={`badge ${getStatusColor(appointment.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3">
                {appointment.status === 'scheduled' && (
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleApprove(appointment.id)}
                      disabled={actionLoading[appointment.id]}
                      className="btn btn-success btn-sm d-flex align-items-center gap-2"
                    >
                      {actionLoading[appointment.id] === 'approve' ? (
                        <Loader size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(appointment.id)}
                      disabled={actionLoading[appointment.id]}
                      className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                    >
                      {actionLoading[appointment.id] === 'reject' ? (
                        <Loader size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span>Decline</span>
                    </button>
                  </div>
                )}

                {appointment.status === 'approved' && (
                  <button
                    onClick={() => handleComplete(appointment.id)}
                    disabled={actionLoading[appointment.id]}
                    className="btn btn-info btn-sm d-flex align-items-center gap-2"
                  >
                    {actionLoading[appointment.id] === 'complete' ? (
                      <Loader size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    <span>Mark as Complete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
