import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Bed, Bath, Home, Loader2 } from 'lucide-react';
import { ENDPOINTS } from '../config/api'; // Import API endpoints

interface Property {
  PropertyID: string;
  Title: string;
  Description: string;
  Price: number;
  Address: string;
  City: string;
  State: string;
  PropertyType: string;
  Bedrooms: number;
  Bathrooms: number;
  SquareFootage: number;
  imageUrls: string[];
  Status: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { isAuthenticated, userType } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await axios.get(ENDPOINTS.PROPERTIES);
        console.log("Properties data:", response.data);
        
        // Ensure we're handling the data structure correctly
        const propertiesData = response.data.properties || [];
        setProperties(propertiesData);
        
        // Initialize image loading state for all properties
        const initialLoadingState: Record<string, boolean> = {};
        propertiesData.forEach((property: Property) => {
          if (property.imageUrls && property.imageUrls.length > 0) {
            initialLoadingState[property.PropertyID] = true;
          } else {
            // If no image URLs, mark as not loading
            initialLoadingState[property.PropertyID] = false;
          }
        });
        setImageLoading(initialLoadingState);
      } catch (error: any) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties');
        toast({
          title: 'Error',
          description: 'Failed to load properties. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  const handleImageLoad = (propertyId: string) => {
    setImageLoading(prev => ({
      ...prev,
      [propertyId]: false
    }));
  };

  const handleImageError = (propertyId: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Image failed to load for property ${propertyId}`);
    // Set fallback image
    event.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
    
    // Update loading state
    setImageLoading(prev => ({
      ...prev,
      [propertyId]: false
    }));
  };

  // Generate a URL-friendly slug from the property title
  const getPropertySlug = (property: Property) => {
    return property.Title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Property Listings</h1>
          {isAuthenticated && userType === 'Client' && (
            <Link to="/create-property">
              <Button variant="default">Create New Listing</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Loading available properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-medium mb-4">No listings available</h2>
            <p className="text-gray-600 mb-6">There are currently no properties listed.</p>
            {isAuthenticated && userType === 'Client' && (
              <Link to="/create-property">
                <Button variant="default">Create Your First Listing</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link 
                to={`/properties/${property.PropertyID}/${getPropertySlug(property)}`}
                key={property.PropertyID} 
                className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-video relative bg-gray-200">
                  {property.imageUrls && property.imageUrls.length > 0 ? (
                    <>
                      {imageLoading[property.PropertyID] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                      <img
                        src={property.imageUrls[0]}
                        alt={property.Title}
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad(property.PropertyID)}
                        onError={(e) => handleImageError(property.PropertyID, e)}
                        loading="lazy"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-sm m-2 rounded">
                    {property.Status}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-white px-4 py-1 rounded-tl-lg">
                    ₱{property.Price ? property.Price.toLocaleString() : 'Price unavailable'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 truncate">{property.Title}</h3>
                  <p className="text-gray-600 mb-2 truncate">{property.Address}, {property.City}{property.State ? `, ${property.State}` : ''}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.Bedrooms || '0'} beds
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.Bathrooms || '0'} baths
                    </span>
                    <span className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      {property.PropertyType}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties; 