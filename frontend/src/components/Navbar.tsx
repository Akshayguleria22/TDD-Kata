import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, CarFront, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center text-blue-600 font-bold text-xl gap-2">
              <CarFront size={28} />
              AutoInventory
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Welcome, </span>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm font-medium transition"
              >
                <ShieldCheck size={16} />
                Admin
              </Link>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
