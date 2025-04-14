import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PropertySearch from '@/components/PropertySearch';
import { FaHome as Home, FaBuilding as Building, FaCompass as Compass } from 'react-icons/fa'; // Import icons

const Index = () => {
  const [isSearchMoved, setIsSearchMoved] = useState(false); // State to control search bar position

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Wrapper for Hero and Features Section */}
        <div
          className={`transition-transform duration-700 ease-in-out ${
            isSearchMoved ? 'translate-y-[-100px] md:translate-y-[-250px]' : 'translate-y-0'
          }`}
        >
          {/* Hero Section */}
          <section
            className={`bg-gradient-to-r from-[#222222] to-[#303030] py-16 md:py-28 relative transition-all duration-700 ease-in-out ${
              isSearchMoved ? 'py-8 md:py-16' : ''
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out"
              style={{
                backgroundImage: `url("https://www.eccp.com/storage/app/uploads/public/582/d74/677/582d74677761a694610640.jpg")`,
                backgroundAttachment: 'fixed', // Retain the blue gradient effect
              }}
            ></div>

            {/* Dark Overlay */}
            <div
              className={`absolute inset-0 bg-black transition-opacity duration-700 ease-in-out ${
                isSearchMoved ? 'opacity-50' : 'opacity-50'
              }`}
            ></div>

            <div
              className={`container mx-auto px-4 text-center relative z-10 transition-all duration-700 ease-in-out ${
                isSearchMoved ? 'mt-4' : ''
              }`}
            >
              <div
                className={`transition-opacity duration-700 ease-in-out ${
                  isSearchMoved ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Find Your Dream Home
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-2xl mx-auto">
                  Search properties for sale or rent with Filicon, your trusted real estate partner
                </p>
              </div>
              <div
                className={`max-w-4xl mx-auto transition-all duration-700 ease-in-out ${
                  isSearchMoved
                    ? 'transform translate-y-[-0px] w-1/3 opacity-100'
                    : 'transform translate-y-0 w-full opacity-100'
                }`}
              >
                <PropertySearch onSearch={() => setIsSearchMoved(true)} />
              </div>
            </div>
          </section>

          {/* Features or Categories Section */}
          {isSearchMoved ? (
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                  Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">Category 1</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">Category 2</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">Category 3</p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="py-16 bg-gray-50">
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
          )}
        </div>
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
