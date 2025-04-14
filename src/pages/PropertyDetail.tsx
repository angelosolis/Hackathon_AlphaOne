import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Home, MapPin, DollarSign, Calendar, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // We only need the ID for the API call, the slug is just for SEO
        const response = await axios.get(`http://localhost:3001/api/properties/${id}`);
        
        if (response.data) {
          // The API returns the property directly, not nested in a property field
          setProperty(response.data);
          
          // Initialize image loading state array
          if (response.data.imageUrls) {
            setImagesLoaded(new Array(response.data.imageUrls.length).fill(false));
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
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageError = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
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
                    <DollarSign className="h-4 w-4 mr-1" />
                    ₱{property.Price ? property.Price.toLocaleString() : 'Contact for Price'}
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
            </div>
          </div>
          
          <div className="lg:col-span-1">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 