import React from 'react';
import { Property } from '@/pages/Index'; // Adjust import path if Property type is moved
import { Bath, BedDouble, Home } from 'lucide-react'; // Or use react-icons/fa

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg border border-gray-200">
      <div className="relative h-48 bg-gray-200">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
        )}
         {/* Optional: Add a status badge */}
         <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded ${
             property.status === 'Active' ? 'bg-green-100 text-green-800' :
             property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
             property.status === 'Sold' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
         }`}>
            {property.status}
         </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{property.title}</h3>
        <p className="text-sm text-gray-500 mb-3 truncate">{property.address}, {property.city}</p>
        <div className="text-xl font-bold text-red-600 mb-3">
          ₱{property.price.toLocaleString()}
        </div>
        <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
          <span className="flex items-center gap-1.5">
            <BedDouble size={16} /> {property.bedrooms} beds
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={16} /> {property.bathrooms} baths
          </span>
          {property.squareFootage && (
             <span className="flex items-center gap-1.5">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                 </svg>
                 {property.squareFootage.toLocaleString()} sqm
             </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
