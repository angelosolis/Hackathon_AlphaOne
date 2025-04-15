
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import MapModal from './MapModal';

interface LocationSelectorProps {
  onSelectLocation: (location: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onSelectLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  
  // Mock locations for demo purposes
  const suggestedLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA'
  ].filter(location => 
    searchTerm ? location.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleLocationClick = (location: string) => {
    onSelectLocation(location);
  };

  const handleOpenMap = () => {
    setShowMap(true);
  };

  const handleMapSelect = (location: string) => {
    onSelectLocation(location);
    setShowMap(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Find Location</DialogTitle>
        <DialogDescription>
          Search for a location or select from the map
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="border rounded-md pl-10 pr-4 py-2 w-full"
            placeholder="City, neighborhood, or ZIP"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-2 max-h-60 overflow-auto">
          {suggestedLocations.map((location, index) => (
            <div 
              key={index} 
              className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => handleLocationClick(location)}
            >
              <MapPin size={18} className="text-estate-teal mr-2" />
              <span>{location}</span>
            </div>
          ))}
        </div>
        
        <button 
          className="flex items-center justify-center w-full py-2 border border-estate-blue text-estate-blue rounded-md hover:bg-estate-blue hover:text-white transition-colors"
          onClick={handleOpenMap}
        >
          Open Map to Select Location
        </button>

        {showMap && (
          <MapModal onSelectLocation={handleMapSelect} onClose={() => setShowMap(false)} />
        )}
      </div>
    </>
  );
};

export default LocationSelector;
