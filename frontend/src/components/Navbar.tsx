import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, CarFront, ShieldCheck, Home, Package, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClasses = (path: string) =>
    `flex items-center gap-1.5 text-sm font-bold font-body transition-colors ${
      isActive(path)
        ? 'text-accent'
        : 'text-foreground/60 hover:text-foreground'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex flex-shrink-0 items-center text-accent font-heading font-extrabold text-2xl gap-2 hover:text-secondary transition-colors">
              <CarFront size={30} strokeWidth={2.5} />
              AutoInventory
            </Link>

            <div className="hidden sm:flex items-center gap-5">
              <Link to="/" className={navLinkClasses('/')}>
                <Home size={16} strokeWidth={2.5} />
                Home
              </Link>
              <Link to="/inventory" className={navLinkClasses('/inventory')}>
                <Package size={16} strokeWidth={2.5} />
                Inventory
              </Link>
              {isAuthenticated && isAdmin && (
                <Link to="/admin" className={navLinkClasses('/admin')}>
                  <ShieldCheck size={16} strokeWidth={2.5} />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          
          {/* Right: Auth actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:block text-sm font-body">
                  <span className="text-foreground/50 font-medium">Welcome, </span>
                  <span className="font-bold text-foreground">{user?.name}</span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground bg-white text-foreground shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover hover:text-red-500 active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
                  title="Logout"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-foreground font-bold border-2 border-foreground bg-white rounded-full px-4 py-1.5 text-sm shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
                >
                  <LogIn size={16} strokeWidth={2.5} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-accent text-white font-bold border-2 border-foreground rounded-full px-4 py-1.5 text-sm shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
                >
                  <UserPlus size={16} strokeWidth={2.5} />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
