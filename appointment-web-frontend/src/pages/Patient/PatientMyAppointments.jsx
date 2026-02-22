import { useState, useEffect } from 'react';
import { Calendar, Loader, Edit2, X } from 'lucide-react';
import { appointmentAPI } from '../../api/client';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

export default function PatientMyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('scheduled');
  const [actionLoading, setActionLoading] = useState({});
  const [rescheduleDialog, setRescheduleDialog] = useState(null);
  const [newDateTime, setNewDateTime] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentAPI.getMyAppointments({
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

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    setActionLoading(prev => ({ ...prev, [appointmentId]: 'cancel' }));
    try {
      await appointmentAPI.cancel(appointmentId);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      );
    } catch (err) {
      alert('Failed to cancel appointment');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  const handleReschedule = async (appointmentId) => {
    if (!newDateTime) {
      alert('Please select a new date and time');
      return;
    }

    setActionLoading(prev => ({ ...prev, [appointmentId]: 'reschedule' }));
    try {
      // Format datetime to Y-m-d H:i
      const [date, time] = newDateTime.split('T');
      const formattedDateTime = `${date} ${time.substring(0, 5)}`;

      await appointmentAPI.reschedule(appointmentId, {
        appointment_start: formattedDateTime,
      });

      alert('Appointment rescheduled successfully!');
      setRescheduleDialog(null);
      setNewDateTime('');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule appointment');
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
      <h1 className="display-5 fw-bold text-dark mb-4">My Appointments</h1>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        {['scheduled', 'approved', 'completed', 'cancelled', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`btn ${
              selectedStatus === status
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded shadow p-5 text-center">
          <Calendar size={40} className="d-block mx-auto mb-3 text-muted" />
          <p className="text-muted fw-semibold">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(appointment => (
            <div key={appointment.id} className="card shadow-sm">
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-3">
                    <p className="small text-muted mb-1">Doctor</p>
                    <p className="fw-semibold text-dark">{appointment.doctor?.user?.name}</p>
                    <p className="small text-primary">{appointment.doctor?.specialization}</p>
                  </div>
                  <div className="col-12 col-md-3">
                    <p className="small text-muted mb-1">Date & Time</p>
                    <p className="fw-semibold text-dark">
                      {formatDateTime(appointment.appointment_start)}
                    </p>
                  </div>
                  <div className="col-12 col-md-3">
                    <p className="small text-muted mb-1">Hospital</p>
                    <p className="fw-semibold text-dark">{appointment.doctor?.hospital_name}</p>
                  </div>
                  <div className="col-12 col-md-3">
                    <p className="small text-muted mb-1">Status</p>
                    <span className={`badge rounded-pill ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="bg-light rounded p-3 mb-3">
                    <p className="small text-muted mb-1">Your Notes</p>
                    <p className="text-dark">{appointment.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {appointment.status === 'scheduled' && (
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => setRescheduleDialog(appointment.id)}
                      className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    >
                      <Edit2 size={18} />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      disabled={actionLoading[appointment.id]}
                      className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                    >
                      {actionLoading[appointment.id] === 'cancel' ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <X size={18} />
                      )}
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Dialog */}
      {rescheduleDialog && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reschedule Appointment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setRescheduleDialog(null);
                    setNewDateTime('');
                  }}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-4">
                  <label className="form-label fw-semibold">New Date and Time</label>
                  <input
                    type="datetime-local"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setRescheduleDialog(null);
                    setNewDateTime('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReschedule(rescheduleDialog)}
                  disabled={actionLoading[rescheduleDialog]}
                >
                  {actionLoading[rescheduleDialog] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Rescheduling...
                    </>
                  ) : (
                    'Reschedule'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
