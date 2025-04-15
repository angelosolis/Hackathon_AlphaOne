import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ENDPOINTS } from '../config/api'; // Import API endpoints

interface ClientProfile {
  UserID: string;
  name: string;
  email: string;
  userType: string;
  IsVerified?: boolean;
  Income?: number;
  CreditScore?: number;
  Budget?: number;
  PreferredLocation?: string[];
  PreferredPropertyType?: string[];
  PreferredBedrooms?: number;
  PreferredBathrooms?: number;
  EmploymentStatus?: string;
  EmploymentVerified?: boolean;
  Phone?: string;
}

const EditClientProfile = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  
  console.log("EditClientProfile: Component mounted");
  console.log("EditClientProfile: Auth token present:", !!token);
  
  // Form states
  const [income, setIncome] = useState<number | undefined>(undefined);
  const [creditScore, setCreditScore] = useState<number | undefined>(undefined);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [preferredPropertyTypes, setPreferredPropertyTypes] = useState<string[]>([]);
  const [newPropertyType, setNewPropertyType] = useState('');
  const [preferredBedrooms, setPreferredBedrooms] = useState<number | undefined>(undefined);
  const [preferredBathrooms, setPreferredBathrooms] = useState<number | undefined>(undefined);
  const [employmentStatus, setEmploymentStatus] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState<string | undefined>(undefined);

  // Fetch profile data
  useEffect(() => {
    console.log("EditClientProfile: useEffect triggered");
    
    const fetchProfile = async () => {
      try {
        console.log("EditClientProfile: Fetching profile data");
        setLoading(true);
        const response = await axios.get(ENDPOINTS.USER_PROFILE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("EditClientProfile: Profile data received:", response.data);
        const profileData = response.data;
        setProfile(profileData);
        
        // Initialize form states
        setIncome(profileData.Income);
        setCreditScore(profileData.CreditScore);
        setBudget(profileData.Budget);
        setPreferredLocations(profileData.PreferredLocation || []);
        setPreferredPropertyTypes(profileData.PreferredPropertyType || []);
        setPreferredBedrooms(profileData.PreferredBedrooms);
        setPreferredBathrooms(profileData.PreferredBathrooms);
        setEmploymentStatus(profileData.EmploymentStatus);
        setPhone(profileData.Phone);
      } catch (error) {
        console.error('EditClientProfile: Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile information.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
        console.log("EditClientProfile: Loading state set to false");
      }
    };
    
    fetchProfile();
  }, [token, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const updatedProfile = {
        Income: income,
        CreditScore: creditScore,
        Budget: budget,
        PreferredLocation: preferredLocations,
        PreferredPropertyType: preferredPropertyTypes,
        PreferredBedrooms: preferredBedrooms,
        PreferredBathrooms: preferredBathrooms,
        EmploymentStatus: employmentStatus,
        Phone: phone
      };
      
      await axios.put(
        ENDPOINTS.USER_PROFILE_CLIENT,
        updatedProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Success',
        description: 'Your financial profile has been updated.'
      });
      
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile information.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Functions to handle tag-like inputs
  const addLocation = () => {
    if (newLocation && !preferredLocations.includes(newLocation)) {
      setPreferredLocations([...preferredLocations, newLocation]);
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setPreferredLocations(preferredLocations.filter(loc => loc !== location));
  };

  const addPropertyType = () => {
    if (newPropertyType && !preferredPropertyTypes.includes(newPropertyType)) {
      setPreferredPropertyTypes([...preferredPropertyTypes, newPropertyType]);
      setNewPropertyType('');
    }
  };

  const removePropertyType = (type: string) => {
    setPreferredPropertyTypes(preferredPropertyTypes.filter(t => t !== type));
  };

  // Property type options
  const propertyTypeOptions = [
    'Apartment', 'Condominium', 'Single Family Home', 'Townhouse', 'Duplex',
    'Land', 'Commercial', 'Industrial', 'Farm/Ranch', 'Multi-family'
  ];

  console.log("EditClientProfile: Rendering, loading:", loading);
  console.log("EditClientProfile: Profile data:", profile);

  if (loading) {
    console.log("EditClientProfile: Rendering loading state");
    return (
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile || profile.userType !== 'Client') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>This page is only accessible to client accounts.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/profile')}>Back to Profile</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Financial Profile</h1>
          <Button variant="outline" onClick={() => navigate('/profile')}>Cancel</Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>
                This information helps us match you with suitable properties and qualify you for viewings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income (₱)</Label>
                  <Input
                    id="income"
                    type="number"
                    min="0"
                    step="1000"
                    value={income || ''}
                    onChange={(e) => setIncome(e.target.valueAsNumber)}
                    placeholder="Your monthly income"
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps determine your affordability range.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditScore">Credit Score (0-850)</Label>
                  <Input
                    id="creditScore"
                    type="number"
                    min="0"
                    max="850"
                    value={creditScore || ''}
                    onChange={(e) => setCreditScore(e.target.valueAsNumber)}
                    placeholder="Your credit score"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Property Budget (₱)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="100000"
                    value={budget || ''}
                    onChange={(e) => setBudget(e.target.valueAsNumber)}
                    placeholder="Your maximum budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select
                    value={employmentStatus || ''}
                    onValueChange={setEmploymentStatus}
                  >
                    <SelectTrigger id="employmentStatus">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employed">Employed</SelectItem>
                      <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                      <SelectItem value="Business Owner">Business Owner</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone || ''}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your contact number"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Property Preferences</CardTitle>
              <CardDescription>
                Help us understand what kind of properties you're looking for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Preferred Locations</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {preferredLocations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {location}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeLocation(location)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add location (e.g., Makati, BGC)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addLocation} variant="outline">Add</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Preferred Property Types</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {preferredPropertyTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removePropertyType(type)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={newPropertyType}
                    onValueChange={setNewPropertyType}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addPropertyType} variant="outline">Add</Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Preferred Bedrooms</Label>
                  <Select
                    value={preferredBedrooms?.toString() || ''}
                    onValueChange={(val) => setPreferredBedrooms(val ? parseInt(val) : undefined)}
                  >
                    <SelectTrigger id="bedrooms">
                      <SelectValue placeholder="Select number of bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Preferred Bathrooms</Label>
                  <Select
                    value={preferredBathrooms?.toString() || ''}
                    onValueChange={(val) => setPreferredBathrooms(val ? parseInt(val) : undefined)}
                  >
                    <SelectTrigger id="bathrooms">
                      <SelectValue placeholder="Select number of bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientProfile; 