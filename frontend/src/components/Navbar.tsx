import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserPlus, LogIn, LogOut, Users, Home, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link to="/" className="text-2xl font-bold hover:text-purple-200 transition-colors duration-200 flex items-center">
          <span className="bg-indigo-600 p-2 rounded-lg mr-2">
            <Users className="h-6 w-6" />
          </span>
          <span>DevHub</span>
        </Link>

        <nav className="flex space-x-1 items-center">
          <Link 
            to="/" 
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isActive('/') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/communities" 
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isActive('/communities') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>My Communities</span>
          </Link>
          <Link 
            to="/browse-communities" 
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isActive('/browse-communities') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            <Search className="h-5 w-5" />
            <span>Browse Communities</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <button
              className={`flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={18} className={isLoggingOut ? "animate-spin" : ""} />
              <span className="hidden sm:inline">
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </span>
            </button>
          ) : (
            <>
              <Link 
                to="/signup" 
                className="hidden sm:flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <UserPlus size={18} />
                <span>Sign Up</span>
              </Link>
              <Link 
                to="/login" 
                className="flex items-center space-x-1 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;