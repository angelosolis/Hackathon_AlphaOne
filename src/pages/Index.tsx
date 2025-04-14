import React from 'react';
import Navbar from '@/components/Navbar';
import PropertySearch from '@/components/PropertySearch';
import { Home, Building, Compass } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#222222] to-[#303030] py-16 md:py-28 relative">
          <div 
            className="absolute inset-0 opacity-50 bg-cover bg-center"
            style={{
              backgroundImage: `url("https://www.eccp.com/storage/app/uploads/public/582/d74/677/582d74677761a694610640.jpg")`,
            }}
          ></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Find Your Dream Home
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
              Search properties for sale or rent with Filicon, your trusted real estate partner
            </p>
            
            <div className="max-w-4xl mx-auto">
              <PropertySearch />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Why Choose Filicon
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-[#FEF7CD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="text-[#EA384C]" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Extensive Listings</h3>
                <p className="text-gray-600">
                  Access thousands of property listings updated in real-time
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-[#D3E4FD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="text-[#EA384C]" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Agents</h3>
                <p className="text-gray-600">
                  Connect with experienced real estate professionals in your area
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-[#FEF7CD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="text-[#EA384C]" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
                <p className="text-gray-600">
                  Find exactly what you're looking for with our powerful search tools
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-[#222222] py-8">
        <div className="container mx-auto px-4 text-center text-white">
          <p className="mb-4">Filicon - Your Real Estate Solution</p>
          <p className="text-sm text-gray-300">© 2025 Filicon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
