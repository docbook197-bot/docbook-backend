import { useState, useEffect } from 'react';
import { Clock, Save, Loader } from 'lucide-react';
import { doctorAPI } from '../../api/client';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_HOURS = {
  start_time: '09:00',
  end_time: '17:00',
  is_available: true,
};

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState(
    DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { ...DEFAULT_HOURS };
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        is_available: !prev[day].is_available,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const availabilityArray = DAYS_OF_WEEK.map(day => ({
        day_of_week: day,
        ...availability[day],
      }));

      await doctorAPI.updateAvailability({ availability: availabilityArray });
      setSuccess('Availability updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="h3 fw-bold text-dark mb-4">Set Your Availability</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-4">
        <div className="d-flex flex-column gap-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="d-flex align-items-center justify-content-between pb-3 border-bottom">
              <div className="d-flex align-items-center gap-3 flex-grow-1">
                <label className="d-flex align-items-center gap-2 mb-0" style={{minWidth: '140px'}}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={availability[day].is_available}
                    onChange={() => handleToggleDay(day)}
                  />
                  <span className="fw-semibold">{day}</span>
                </label>

                {availability[day].is_available && (
                  <div className="d-flex gap-3 flex-grow-1">
                    <div>
                      <label className="form-label small mb-1">Start Time</label>
                      <input
                        type="time"
                        value={availability[day].start_time}
                        onChange={(e) => handleChange(day, 'start_time', e.target.value)}
                        className="form-control form-control-sm"
                      />
                    </div>
                    <div>
                      <label className="form-label small mb-1">End Time</label>
                      <input
                        type="time"
                        value={availability[day].end_time}
                        onChange={(e) => handleChange(day, 'end_time', e.target.value)}
                        className="form-control form-control-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {!availability[day].is_available && (
                <span className="text-muted small">Not Available</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            {loading && <Loader size={18} style={{animation: 'spin 1s linear infinite'}} />}
            <Save size={18} />
            <span>{loading ? 'Saving...' : 'Save Availability'}</span>
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-light border border-info rounded">
        <h5 className="fw-semibold mb-2">Tips for setting availability</h5>
        <ul className="small mb-0">
          <li>• Set your working hours for each day</li>
          <li>• Patients can only book appointments during your available hours</li>
          <li>• Toggle off a day if you're not available</li>
          <li>• You can update your availability anytime</li>
        </ul>
      </div>
    </div>
  );
}
