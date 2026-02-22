import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Upload } from 'lucide-react';
import { authAPI, doctorAPI } from '../api/client';
import { authStorage } from '../utils/helpers';

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

export default function DoctorProfileSetup() {
  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState({
    specialization_id: '',
    hospital_name: '',
    bio: '',
    consultation_duration: 30,
    consultation_fee: '',
    profile_picture: null,
    certificate: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.me();
        setUserId(response.data.user.id);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data');
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      
      if (name === 'profile_picture') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const setupData = {
        user_id: userId,
        ...formData,
      };

      await authAPI.completeDoctorProfile(setupData);
      
      // Fetch updated user data with doctor profile info
      const response = await authAPI.me();
      authStorage.setUser(response.data.user);
      
      // Reload the page to sync the app state with updated user data
      window.location.href = '/doctor';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light py-5 px-4" style={{minHeight: '100vh'}}>
      <div className="card shadow-lg" style={{maxWidth: '600px', margin: '0 auto'}}>
        <div className="card-body p-5">
          <h1 className="card-title display-6 fw-bold text-dark mb-2">Complete Your Doctor Profile</h1>
          <p className="text-muted mb-4">Please provide your professional information</p>

          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label htmlFor="specialization_id" className="form-label fw-semibold">
                Specialization *
              </label>
              <select
                id="specialization_id"
                name="specialization_id"
                value={formData.specialization_id}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select Specialization</option>
                {SPECIALIZATIONS.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="hospital_name" className="form-label fw-semibold">
                Hospital/Clinic Name *
              </label>
              <input
                id="hospital_name"
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter hospital or clinic name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="bio" className="form-label fw-semibold">
                Professional Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-control"
                placeholder="Tell patients about your experience and expertise"
                rows="4"
              />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="consultation_duration" className="form-label fw-semibold">
                  Consultation Duration (minutes) *
                </label>
                <input
                  id="consultation_duration"
                  type="number"
                  name="consultation_duration"
                  value={formData.consultation_duration}
                  onChange={handleChange}
                  min="15"
                  max="480"
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="consultation_fee" className="form-label fw-semibold">
                  Consultation Fee ($)
                </label>
                <input
                  id="consultation_fee"
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="profile_picture" className="form-label fw-semibold">
                Profile Picture *
              </label>
              <div className="d-flex align-items-center gap-3">
                {previewImage && (
                  <img src={previewImage} alt="Preview" className="rounded-circle" style={{width: '80px', height: '80px', objectFit: 'cover'}} />
                )}
                <label className="flex-grow-1 d-flex align-items-center justify-content-center p-4 border-2 border-dashed rounded cursor-pointer" style={{borderColor: '#dee2e6', cursor: 'pointer', minHeight: '120px'}}>
                  <div className="text-center">
                    <Upload size={24} className="text-muted d-block mb-2" style={{margin: '0 auto'}} />
                    <span className="text-muted">Upload Profile Picture</span>
                  </div>
                  <input
                    id="profile_picture"
                    type="file"
                    name="profile_picture"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    style={{display: 'none'}}
                  />
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="certificate" className="form-label fw-semibold">
                Medical Certificate/License *
              </label>
              <label className="d-flex align-items-center justify-content-center p-4 border-2 border-dashed rounded" style={{borderColor: '#dee2e6', cursor: 'pointer', minHeight: '120px'}}>
                <div className="text-center">
                  <Upload size={24} className="text-muted d-block mb-2" style={{margin: '0 auto'}} />
                  <span className="text-muted d-block">
                    {formData.certificate ? formData.certificate.name : 'Upload Certificate (PDF, JPG, PNG)'}
                  </span>
                </div>
                <input
                  id="certificate"
                  type="file"
                  name="certificate"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  style={{display: 'none'}}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
            >
              {submitting && <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div>}
              <span>{submitting ? 'Setting Up...' : 'Complete Profile'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
