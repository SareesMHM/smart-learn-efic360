import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
