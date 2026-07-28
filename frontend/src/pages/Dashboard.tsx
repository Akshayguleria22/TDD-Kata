import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {user?.name}!</p>
      
      {user?.role === 'admin' && (
        <button 
          onClick={() => navigate('/admin')}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-4 hover:bg-blue-700 transition"
        >
          Admin Panel
        </button>
      )}

      <button 
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
