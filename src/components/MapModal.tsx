
import React from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapModalProps {
  onSelectLocation: (location: string) => void;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ onSelectLocation, onClose }) => {
  // For this demo, we'll just simulate selecting from predefined locations
  const locations = [
    { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Select Location from Map</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex-grow p-4 overflow-auto">
          <div className="bg-gray-200 h-64 flex items-center justify-center rounded-md mb-4">
            <p className="text-gray-500">Map would be displayed here</p>
            <p className="text-gray-500 text-sm">(Requires API integration)</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">Select a location:</p>
            {locations.map((location, index) => (
              <div 
                key={index}
                className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-100"
                onClick={() => onSelectLocation(location.name)}
              >
                <MapPin size={18} className="text-estate-teal mr-2" />
                <span>{location.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t">
          <p className="text-xs text-gray-500 mb-2">
            Note: In a production app, this would be integrated with Google Maps or 
            a similar mapping service.
          </p>
          <Button className="bg-estate-teal hover:bg-estate-blue text-white" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
