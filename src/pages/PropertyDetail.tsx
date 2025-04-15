import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Home, MapPin, Calendar, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import 'leaflet/dist/leaflet.css';
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
  CreationDate: string;
  LastUpdated: string;
  Status: string;
  ViewCount?: number;
  Latitude?: number;
  Longitude?: number;
}

const PropertyDetail = () => {
  // Extract both id and slug from the URL params
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const { toast } = useToast();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching property details for ID: ${id}`);
        // Use the endpoint from the config instead of hardcoded URL
        const response = await axios.get(ENDPOINTS.PROPERTY_DETAIL(id));
        console.log("Property detail response:", response.data);
        
        if (response.data) {
          // The API returns the property directly
          const propertyData = response.data;
          setProperty(propertyData);
          
          // Initialize image loading state array
          if (propertyData.imageUrls && propertyData.imageUrls.length > 0) {
            console.log(`Property has ${propertyData.imageUrls.length} images:`, propertyData.imageUrls);
            setImagesLoaded(new Array(propertyData.imageUrls.length).fill(false));
          } else {
            console.log("Property has no images");
          }
        } else {
          setError('Property not found');
          toast({
            title: 'Error',
            description: 'Property information could not be found',
            variant: 'destructive'
          });
        }
      } catch (error: any) {
        console.error('Error fetching property details:', error);
        setError('Failed to load property details');
        toast({
          title: 'Error',
          description: 'Failed to load property details. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetail();
    }
  }, [id, toast]);

  const handleImageLoad = (index: number) => {
    console.log(`Image ${index} loaded successfully`);
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageError = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Image ${index} failed to load`);
    event.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Available';
    handleImageLoad(index);
  };

  const nextImage = () => {
    if (property?.imageUrls && property.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.imageUrls && property.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.imageUrls.length - 1 : prevIndex - 1
      );
    }
  };

  const renderImageGallery = () => {
    if (!property?.imageUrls || property.imageUrls.length === 0) {
      return (
        <div className="bg-gray-200 rounded-lg flex items-center justify-center h-96">
          <span className="text-gray-400">No images available</span>
        </div>
      );
    }

    return (
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="aspect-w-16 aspect-h-9 h-96 bg-gray-100 rounded-lg relative">
          {!imagesLoaded[currentImageIndex] && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          <img
            src={property.imageUrls[currentImageIndex]}
            alt={`${property.Title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => handleImageLoad(currentImageIndex)}
            onError={(e) => handleImageError(currentImageIndex, e)}
            style={{ display: imagesLoaded[currentImageIndex] ? 'block' : 'none' }}
            loading="lazy"
          />
          {property.imageUrls.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.imageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {property.imageUrls.length > 1 && (
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {property.imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 ${
                  index === currentImageIndex ? 'ring-2 ring-primary' : 'opacity-70'
                }`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-16 w-16 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400?text=No+Thumbnail';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Property Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The property you are looking for could not be found.'}</p>
            <Link to="/properties">
              <Button variant="default" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/properties" className="inline-flex items-center text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Properties
          </Link>
          <h1 className="text-3xl font-semibold">{property.Title}</h1>
          <div className="flex items-center text-gray-600 mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.Address}, {property.City}{property.State ? `, ${property.State}` : ''}</span>
          </div>
          {property.ViewCount !== undefined && (
             <div className="flex items-center text-gray-500 text-sm mt-1">
               <Eye className="h-4 w-4 mr-1" /> 
               <span>{property.ViewCount} views</span>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {renderImageGallery()}

            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Price</span>
                  <span className="font-semibold flex items-center">
                    <span className="mr-1 font-bold">₱</span>
                    {property.Price ? property.Price.toLocaleString() : 'Contact for Price'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Property Type</span>
                  <span className="font-semibold flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    {property.PropertyType}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Bedrooms</span>
                  <span className="font-semibold flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.Bedrooms}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Bathrooms</span>
                  <span className="font-semibold flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.Bathrooms}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Square Footage</span>
                  <span className="font-semibold">{property.SquareFootage ? `${property.SquareFootage} sq ft` : 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className="font-semibold">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.Status === 'Active' ? 'bg-green-100 text-green-800' :
                      property.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      property.Status === 'Sold' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.Status}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Listed On</span>
                  <span className="font-semibold flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {property.CreationDate ? new Date(property.CreationDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">{property.Description}</p>
              
              {/* Add Property Location Map */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <PropertyLocationMap property={property} />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {isAuthenticated && (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Contact Agent</h2>
                <p className="text-gray-600 mb-6">Interested in this property? Contact the listing agent for more information or to schedule a viewing.</p>
                <Link to={`/chat?propertyId=${property.PropertyID}`} state={{ propertyDetails: property }}>
                  <Button className="w-full mb-2">Request Information</Button>
                </Link>
                <Link to={`/chat?propertyId=${property.PropertyID}&subject=viewing`} state={{ propertyDetails: property, subject: "viewing" }}>
                  <Button variant="outline" className="w-full">Schedule Viewing</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add the PropertyLocationMap component
const PropertyLocationMap = ({ property }: { property: Property }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  // Get the full address as a formatted string
  const getFullAddress = () => {
    const parts = [];
    if (property.Address) parts.push(property.Address);
    if (property.City) parts.push(property.City);
    if (property.State) parts.push(property.State);
    
    return parts.join(', ');
  };
  
  const fullAddress = getFullAddress();
  
  useEffect(() => {
    // Exit early if coordinates are missing
    if (!property.Latitude || !property.Longitude) {
      console.warn(`Property ${property.PropertyID} is missing coordinates. Cannot display map.`);
      setMapError(true); // Set error state to display message
      return;
    }
    
    const initializeMap = async () => {
      const latitude = property.Latitude!;
      const longitude = property.Longitude!;
            
      try {
        // Dynamically import Leaflet
        const L = await import('leaflet');
        
        // Fix the default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
        
        // If a map already exists, remove it
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        
        // Create a new map instance
        if (mapRef.current) {
          const map = L.map(mapRef.current).setView([latitude, longitude], 15);
          mapInstanceRef.current = map;
          
          // Add the tile layer (map imagery)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Add marker for the property
          const marker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`
              <div style="width: 180px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${property.Title}</h3>
                <p style="font-size: 12px; margin-bottom: 4px;">${fullAddress}</p>
                <p style="font-weight: bold; color: #ef4444;">₱${property.Price ? property.Price.toLocaleString() : 'Price unavailable'}</p>
              </div>
            `)
            .openPopup();
            
          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error initializing property location map:', error);
        setMapError(true);
      }
    };
    
    initializeMap();
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [property]);
  
  if (mapError) {
    return (
      <div className="space-y-2">
        <div className="text-gray-700 mb-2">
          <MapPin className="h-5 w-5 inline-block mr-1 text-gray-500" />
          <span>{fullAddress}</span>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center border">
          <p className="text-gray-600 text-sm">Map location not available for this property.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="text-gray-700 mb-2">
        <MapPin className="h-5 w-5 inline-block mr-1 text-gray-500" />
        <span>{fullAddress}</span>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {!mapLoaded && (
          <div className="h-64 flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading map...</span>
          </div>
        )}
        <div 
          ref={mapRef} 
          className="h-64 w-full"
          style={{ display: mapLoaded ? 'block' : 'none' }}
        ></div>
      </div>
    </div>
  );
};

export default PropertyDetail; 