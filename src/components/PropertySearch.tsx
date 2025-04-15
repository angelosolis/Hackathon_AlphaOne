
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import LocationSelector from './LocationSelector';
import PriceRangeSelector from './PriceRangeSelector';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type PropertyType = 'any' | 'sale' | 'rent' | 'foreclosure';

const PropertySearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PropertyType>('any');
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const handleTabClick = (tab: PropertyType) => {
    setActiveTab(tab);
  };

  const handleLocationSelect = (newLocation: string) => {
    setLocation(newLocation);
    setShowLocationSelector(false);
  };

  const handlePriceChange = (min: number | null, max: number | null) => {
    setPriceRange({ min, max });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex flex-wrap justify-center gap-1 mb-4">
        <button 
          className={`filter-tab ${activeTab === 'any' ? 'active' : 'bg-gray-100'}`}
          onClick={() => handleTabClick('any')}
        >
          Any
        </button>
        <button
          className={`filter-tab ${activeTab === 'sale' ? 'active' : 'bg-gray-100'}`}
          onClick={() => handleTabClick('sale')}
        >
          For Sale
        </button>
        <button
          className={`filter-tab ${activeTab === 'rent' ? 'active' : 'bg-gray-100'}`}
          onClick={() => handleTabClick('rent')}
        >
          For Rent
        </button>
        <button
          className={`filter-tab ${activeTab === 'foreclosure' ? 'active' : 'bg-gray-100'}`}
          onClick={() => handleTabClick('foreclosure')}
        >
          Foreclosure
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <div
            className={`border rounded-md p-3 flex items-center cursor-pointer ${
              location ? 'bg-gray-50' : ''
            }`}
            onClick={() => setShowLocationSelector(true)}
          >
            <Search size={18} className="text-gray-400 mr-2" />
            <span className={`${!location ? 'text-gray-400' : 'text-[#222222]'}`}>
              {location || 'Enter address, city, or ZIP code'}
            </span>
          </div>
          
          <Dialog open={showLocationSelector} onOpenChange={setShowLocationSelector}>
            <DialogContent className="sm:max-w-md">
              <LocationSelector onSelectLocation={handleLocationSelect} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border-[#EA384C] text-[#222222]"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                <span>Filters</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Property Type</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className={`px-3 py-1 rounded-full text-sm ${activeTab === 'any' ? 'bg-[#EA384C] text-white' : 'bg-gray-100'}`}
                    >
                      Any
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full text-sm ${activeTab === 'sale' ? 'bg-[#EA384C] text-white' : 'bg-gray-100'}`}
                    >
                      For Sale
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full text-sm ${activeTab === 'rent' ? 'bg-[#EA384C] text-white' : 'bg-gray-100'}`}
                    >
                      For Rent
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full text-sm ${activeTab === 'foreclosure' ? 'bg-[#EA384C] text-white' : 'bg-gray-100'}`}
                    >
                      Foreclosure
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <PriceRangeSelector 
                    minPrice={priceRange.min} 
                    maxPrice={priceRange.max} 
                    onPriceChange={handlePriceChange} 
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            className="bg-[#EA384C] hover:bg-[#d1293c] text-white"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
