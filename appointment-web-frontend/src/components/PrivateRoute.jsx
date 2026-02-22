import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ user, role, children }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} />;
  }

  return children;
}
