import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PropertySearch from '@/components/PropertySearch';
import { FaHome as Home, FaBuilding as Building, FaCompass as Compass } from 'react-icons/fa'; // Import icons

const Index = () => {
  const [isSearchMoved, setIsSearchMoved] = useState(false); // State to control search bar position
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control dropdown

  const handleDropdownClick = () => {
    setIsDropdownOpen(true); // Open the dropdown
  };

  const handleDropdownBlur = () => {
    setIsDropdownOpen(false); // Close the dropdown
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Wrapper for Hero and Features Section */}
        <div
          className={`transition-transform duration-700 ease-in-out ${
            isSearchMoved ? 'translate-y-[-100px] md:translate-y-[-200px]' : 'translate-y-0'
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
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("https://www.eccp.com/storage/app/uploads/public/582/d74/677/582d74677761a694610640.jpg")`,
                backgroundAttachment: 'fixed', // Retain the blue gradient effect
              }}
            ></div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
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
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Price Range */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Price Range</h3>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Min Budget"
                        className="w-full border rounded-md p-2"
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); // Allow only numbers
                        }}
                        onBlur={(e) => {
                          const value = e.currentTarget.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                          if (value) {
                            e.currentTarget.value = `₱${value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; // Add commas and prepend ₱
                          }
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Max Budget"
                        className="w-full border rounded-md p-2"
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); // Allow only numbers
                        }}
                        onBlur={(e) => {
                          const value = e.currentTarget.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                          if (value) {
                            e.currentTarget.value = `₱${value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; // Add commas and prepend ₱
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Property Purpose */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Property Purpose</h3>
                    <select className="w-full border rounded-md p-2">
                      <option value="any">Any</option>
                      <option value="for-sale">For Sale</option>
                      <option value="for-rent">For Rent</option>
                      <option value="foreclosure">Foreclosure</option>
                    </select>
                  </div>

                  {/* Property Type */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Property Type</h3>
                    <div className="relative">
                      <select
                        className="w-full border rounded-md p-2 appearance-none"
                        size={isDropdownOpen ? 5 : 1} // Dynamically set size
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent default behavior to keep dropdown open
                          setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown open/close
                        }}
                        onBlur={() => setIsDropdownOpen(false)} // Close dropdown when it loses focus
                        onChange={(e) => {
                          console.log(`Selected: ${e.target.value}`); // Handle selection
                          setIsDropdownOpen(false); // Close dropdown after selection
                        }}
                        style={{
                          position: isDropdownOpen ? 'absolute' : 'relative', // Make dropdown absolute when open
                          zIndex: isDropdownOpen ? 10 : 'auto', // Ensure dropdown appears above other elements
                          background: 'white', // Ensure dropdown background is visible
                        }}
                      >
                        <option value="house">House</option>
                        <option value="condominium">Condominium</option>
                        <option value="apartment">Apartment</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="duplex">Duplex</option>
                        <option value="triplex">Triplex</option>
                        <option value="fourplex">Fourplex</option>
                        <option value="mobile-home">Mobile Home</option>
                        <option value="manufactured-home">Manufactured Home</option>
                        <option value="villa">Villa</option>
                        <option value="cottage">Cottage</option>
                        <option value="bungalow">Bungalow</option>
                        <option value="studio">Studio</option>
                        <option value="loft">Loft</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="row-house">Row House</option>
                        <option value="cabin">Cabin</option>
                        <option value="farmhouse">Farmhouse</option>
                        <option value="container-home">Container Home</option>
                        <option value="co-op">Co-op</option>
                      </select>
                    </div>
                  </div>
                </form>

                {/* Check Listings Button */}
                <div className="text-center mt-8">
                  <button className="bg-[#EA384C] hover:bg-[#d1293c] text-white font-semibold py-3 px-6 rounded-lg shadow-md">
                    Check Listings
                  </button>
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
