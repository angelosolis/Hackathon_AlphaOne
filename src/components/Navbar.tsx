import React, { useState } from 'react';
import { Menu, X, User, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // Get the current location

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#EA384C] rounded-full flex items-center justify-center">
                <Home size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#222222]">Filicon</h1>
            </a>
          </div>
          
          <nav className="hidden md:flex space-x-2">
            <a href="/" className="nav-link active">Home</a>
            <a href="/about" className="nav-link">About Us</a>
            <a href="/blogs" className="nav-link">Blogs</a>
            <a href="/agents" className="nav-link">Find an Agent</a>
          </nav>
          
          <div className="hidden md:flex items-center space-x-2">
            {location.pathname === '/login' ? (
              <Link
                to="/register"
                className="flex items-center gap-2 border-[#EA384C] text-[#EA384C] hover:bg-[#EA384C] hover:text-white px-4 py-2 rounded-lg font-semibold"
              >
                <User size={18} />
                <span>Register</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 border-[#EA384C] text-[#EA384C] hover:bg-[#EA384C] hover:text-white px-4 py-2 rounded-lg font-semibold"
              >
                <User size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
          
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-[#222222] hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <a href="/" className="block px-3 py-2 text-[#222222] font-medium rounded-md">Home</a>
            <a href="/about" className="block px-3 py-2 text-[#222222] hover:text-[#EA384C] rounded-md">About Us</a>
            <a href="/blogs" className="block px-3 py-2 text-[#222222] hover:text-[#EA384C] rounded-md">Blogs</a>
            <a href="/agents" className="block px-3 py-2 text-[#222222] hover:text-[#EA384C] rounded-md">Find an Agent</a>
            {location.pathname === '/login' ? (
              <Link
                to="/register"
                className="block px-3 py-2 text-[#222222] hover:text-[#EA384C] rounded-md"
              >
                Register
              </Link>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 text-[#222222] hover:text-[#EA384C] rounded-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
