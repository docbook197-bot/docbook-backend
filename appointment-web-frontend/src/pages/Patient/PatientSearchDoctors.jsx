import { useState, useEffect } from 'react';
import { Search, Loader, MapPin, DollarSign, Clock, Calendar } from 'lucide-react';
import { doctorAPI, appointmentAPI } from '../../api/client';
import { formatDateTime } from '../../utils/helpers';

const SPECIALIZATIONS = [
  { id: 1, name: 'Cardiology' },
  { id: 2, name: 'Neurology' },
  { id: 3, name: 'Dermatology' },
  { id: 4, name: 'Orthopedics' },
  { id: 5, name: 'Pediatrics' },
  { id: 6, name: 'Psychiatry' },
  { id: 7, name: 'Oncology' },
  { id: 8, name: 'Gastroenterology' },
  { id: 9, name: 'Ophthalmology' },
  { id: 10, name: 'ENT (Otolaryngology)' },
  { id: 11, name: 'Nephrology' },
  { id: 12, name: 'Pulmonology' },
  { id: 13, name: 'Endocrinology' },
  { id: 14, name: 'Rheumatology' },
  { id: 15, name: 'Urology' },
];

export default function PatientSearchDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    specialization_id: '',
    hospital: '',
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await doctorAPI.search({
        ...filters,
        page: 1,
      });
      setDoctors(response.data.doctors.data || []);
    } catch (err) {
      setError('Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlots = async (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentDate(new Date().toISOString().split('T')[0]);
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setAppointmentDate(date);

    setSlotsLoading(true);
    try {
      const response = await doctorAPI.getAvailableSlots(selectedDoctor.id, date);
      setAvailableSlots(response.data.slots || []);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookAppointment = async (slot) => {
    setBookingDoctor(selectedDoctor.id);
    try {
      // Format slot.start to Y-m-d H:i format
      const appointmentDate = new Date(slot.start);
      const formattedDate = appointmentDate.toISOString().split('T')[0]; // Y-m-d
      const formattedTime = appointmentDate.toTimeString().split(' ')[0].substring(0, 5); // H:i
      const appointmentStart = `${formattedDate} ${formattedTime}`;

      await appointmentAPI.create({
        doctor_id: selectedDoctor.id,
        appointment_start: appointmentStart,
        notes: appointmentNotes,
      });

      alert('Appointment booked successfully!');
      setSelectedDoctor(null);
      setAppointmentDate('');
      setAvailableSlots([]);
      setAppointmentNotes('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingDoctor(null);
    }
  };

  return (
    <div>
      <h1 className="display-5 fw-bold text-dark mb-4">Find Doctors</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded shadow-lg p-4 mb-5">
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6 col-lg-3">
            <input
              type="text"
              name="name"
              placeholder="Doctor name..."
              value={filters.name}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <select
              name="specialization_id"
              value={filters.specialization_id}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <input
              type="text"
              name="hospital"
              placeholder="Hospital name..."
              value={filters.hospital}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3 d-flex">
            <button
              type="submit"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {/* Doctors List */}
      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded shadow p-5 text-center">
          <Search size={40} className="d-block mx-auto mb-4 text-muted" />
          <p className="text-muted fw-semibold">No doctors found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="row g-4">
          {doctors.map(doctor => (
            <div key={doctor.id} className="col-12 col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex gap-4 mb-4">
                    {doctor.profile_picture_url ? (
                      <img
                        src={doctor.profile_picture_url}
                        alt={doctor.user?.name}
                        className="rounded-circle"
                        style={{width: '70px', height: '70px', objectFit: 'cover'}}
                      />
                    ) : (
                      <div className="rounded-circle bg-light" style={{width: '70px', height: '70px'}}></div>
                    )}

                    <div className="flex-grow-1">
                      <h5 className="card-title fw-bold text-dark">{doctor.user?.name}</h5>
                      <p className="text-primary fw-semibold mb-2 small">{doctor.specialization}</p>

                      <div className="small text-muted space-y-1">
                        <div className="mb-2">
                          <MapPin size={14} className="me-2" style={{display: 'inline'}} />
                          {doctor.hospital_name}
                        </div>
                        <div className="mb-2">
                          <DollarSign size={14} className="me-2" style={{display: 'inline'}} />
                          ${doctor.consultation_fee || 'N/A'}
                        </div>
                        <div>
                          <Clock size={14} className="me-2" style={{display: 'inline'}} />
                          {doctor.consultation_duration} mins
                        </div>
                      </div>
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="card-text small text-muted mb-3">{doctor.bio}</p>
                  )}

                  <button
                    onClick={() => handleViewSlots(doctor)}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <Calendar size={18} />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Book Appointment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedDoctor(null)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="alert alert-info mb-4">
                  <p className="mb-1 small text-muted">Selected Doctor</p>
                  <p className="fw-bold text-dark mb-1">{selectedDoctor.user?.name}</p>
                  <p className="text-primary small">{selectedDoctor.specialization}</p>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-control"
                  />
                </div>

                {slotsLoading ? (
                  <div className="d-flex align-items-center justify-content-center py-4">
                    <div className="spinner-border text-primary spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Available Time Slots</label>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '200px', overflowY: 'auto'}}>
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleBookAppointment(slot)}
                          disabled={bookingDoctor}
                          className="btn btn-outline-primary btn-sm"
                        >
                          {new Date(slot.start).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning mb-4">
                    <p className="mb-0">No available slots for this date</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-semibold">Additional Notes (Optional)</label>
                  <textarea
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    className="form-control"
                    placeholder="Describe your symptoms or concerns..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
