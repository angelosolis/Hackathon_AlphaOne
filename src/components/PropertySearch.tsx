import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import LocationSelector from './LocationSelector';
import { Dialog, DialogContent } from "@/components/ui/dialog";

type PropertySearchProps = {
  onSearch: () => void; // Callback to notify parent when search is triggered
};

const PropertySearch: React.FC<PropertySearchProps> = ({ onSearch }) => {
  const [location, setLocation] = useState<string>('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const handleLocationSelect = (newLocation: string) => {
    setLocation(newLocation);
    setShowLocationSelector(false);
  };

  const handleSearch = () => {
    onSearch(); // Notify parent to move the search bar
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 md:p-6">
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
          <Button 
            className="bg-[#EA384C] hover:bg-[#d1293c] text-white"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
