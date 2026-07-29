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
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center text-accent font-heading font-extrabold text-2xl gap-2 hover:text-secondary transition-colors">
              <CarFront size={30} strokeWidth={2.5} />
              AutoInventory
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm font-body">
              <span className="text-foreground/50 font-medium">Welcome, </span>
              <span className="font-bold text-foreground">{user?.name}</span>
            </div>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1.5 bg-secondary text-white border-2 border-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
              >
                <ShieldCheck size={16} strokeWidth={2.5} />
                Admin
              </Link>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground bg-white text-foreground shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover hover:text-red-500 active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
              title="Logout"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
