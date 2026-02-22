import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader } from 'lucide-react';
import { authAPI } from '../api/client';
import { authStorage } from '../utils/helpers';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      
      authStorage.setToken(token);
      authStorage.setUser(user);
      onLogin(user);

      if (user.role === 'doctor' && !user.doctor) {
        navigate('/doctor/setup');
      } else {
        navigate(user.role === 'doctor' ? '/doctor' : '/patient');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="w-100" style={{maxWidth: '400px'}}>
        <div className="card shadow-lg">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-primary mb-2">💉 MedBook</h1>
              <p className="text-muted mb-0">Doctor Appointment System</p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <small>{error}</small>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"><Mail size={18} className="text-muted" /></span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><Lock size={18} className="text-muted" /></span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {loading && <Loader size={18} className="spinner-border spinner-border-sm" style={{animation: 'spin 1s linear infinite'}} />}
                <span>{loading ? 'Logging in...' : 'Login'}</span>
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">Don't have an account?</p>
              <Link to="/register" className="text-decoration-none fw-semibold">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
