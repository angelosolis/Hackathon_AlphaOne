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
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 border rounded-md p-3 bg-gray-50">
        <div className="flex items-center">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Enter address, city, or ZIP code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent outline-none text-[#222222] placeholder-gray-400"
          />
        </div>
        <Button
          className="bg-[#EA384C] hover:bg-[#d1293c] text-white"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {/* Location Selector Dialog */}
      <Dialog open={showLocationSelector} onOpenChange={setShowLocationSelector}>
        <DialogContent className="sm:max-w-md">
          <LocationSelector onSelectLocation={handleLocationSelect} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertySearch;
