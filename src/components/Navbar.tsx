import React, { useState } from 'react';
import { Menu, X, User, Home, LogOut, UserCircle, Building, BarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import logoImage from '../assets/491340402_653939030702596_2002223735433078664_n.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, userType, userId } = useAuth();

  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white-500 rounded-full flex items-center justify-center">
                <img src={logoImage} alt="PhilCon Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">PhilCon</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
            <Link to="/properties" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Building size={16} />
                Properties
              </span>
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">About Us</Link>
            <Link to="/blogs" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Blogs</Link>
            <Link to="/agents" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">Find an Agent</Link>
            {isAuthenticated && (
              <Link to="/profile" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <UserCircle size={16} />
                  Profile
                </span>
              </Link>
            )}
            {isAuthenticated && userType === 'Agent' && (
              <Link to="/agent-dashboard" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <BarChart size={16} />
                  Dashboard
                </span>
              </Link>
            )}
          </nav>
          
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-1.5 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    <User size={16} />
                    <span>Login</span>
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    <span>Register</span>
                  </Link>
                )}
              </>
            )}
          </div>
          
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden border-t" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <Link to="/" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md">Home</Link>
            <Link to="/properties" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md">Properties</Link>
            <Link to="/about" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md">About Us</Link>
            <Link to="/blogs" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md">Blogs</Link>
            <Link to="/agents" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md">Find an Agent</Link>
            {isAuthenticated && <Link to="/profile" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md flex items-center gap-2"><UserCircle size={18} /> Profile</Link>}
            {isAuthenticated && userType === 'Agent' && <Link to="/agent-dashboard" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md flex items-center gap-2"><BarChart size={18} /> Dashboard</Link>}
            <hr className="my-2" />
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); closeMobileMenu(); }}
                className="w-full flex items-center justify-start gap-2 px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50 rounded-md"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md"
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md"
                  >
                    Register
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
