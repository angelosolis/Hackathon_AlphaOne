import React from 'react';
import Navbar from '@/components/Navbar'; // Import the shared Navbar component
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar /> {/* Use the shared Navbar */}
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Register with Filicon</h2>
          <form>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                placeholder="Enter your full name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#EA384C] text-white py-2 rounded-lg font-semibold hover:bg-[#c32f3e] transition"
            >
              Register
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#EA384C] font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;