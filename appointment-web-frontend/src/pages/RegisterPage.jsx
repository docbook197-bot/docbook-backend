import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Loader } from 'lucide-react';
import { authAPI } from '../api/client';
import { authStorage } from '../utils/helpers';

export default function RegisterPage({ onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    role: 'patient',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      const { user } = response.data;
      
      if (user.role === 'doctor') {
        navigate('/login', { state: { email: formData.email } });
        return;
      }

      const loginResponse = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      const { user: userData, token } = loginResponse.data;
      authStorage.setToken(token);
      authStorage.setUser(userData);
      onRegister(userData);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="w-100" style={{maxWidth: '450px'}}>
        <div className="card shadow-lg">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-primary mb-2">💉 MedBook</h1>
              <p className="text-muted">Create Your Account</p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <small>{error}</small>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label small fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text"><User size={18} className="text-muted" /></span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"><Mail size={18} className="text-muted" /></span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="phone_number" className="form-label small fw-semibold">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text"><Phone size={18} className="text-muted" /></span>
                  <input
                    id="phone_number"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold d-block">Register As</label>
                <div className="btn-group w-100" role="group">
                  <input type="radio" className="btn-check" name="role" value="patient" 
                    checked={formData.role === 'patient'} onChange={handleChange} id="role_patient" />
                  <label className="btn btn-outline-primary" htmlFor="role_patient">Patient</label>
                  
                  <input type="radio" className="btn-check" name="role" value="doctor" 
                    checked={formData.role === 'doctor'} onChange={handleChange} id="role_doctor" />
                  <label className="btn btn-outline-primary" htmlFor="role_doctor">Doctor</label>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><Lock size={18} className="text-muted" /></span>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password_confirmation" className="form-label small fw-semibold">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text"><Lock size={18} className="text-muted" /></span>
                  <input
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
              >
                {loading && <Loader size={18} />}
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">Already have an account?</p>
              <Link to="/login" className="text-decoration-none fw-semibold">Login Here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
