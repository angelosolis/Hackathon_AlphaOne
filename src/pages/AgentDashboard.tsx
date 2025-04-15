import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check, X, Calendar, Clock, User, Home, MapPin, Search, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Interface matching the structure returned by getUnassignedProperties
interface UnassignedProperty {
    PropertyID: string;
    Title: string;
    Address: string;
    City: string;
    State?: string; // Make optional if not always present
    CreationDate: string;
    imageUrls: string[]; // Only includes thumbnail
}

// Interface matching the structure returned by getAgentAppointments
interface RequestedAppointment {
    AppointmentID: string;
    PropertyID: string;
    ClientID: string; // We might want to fetch Client details later
    RequestedDateTime: string;
    Status: string;
    Type: string;
    Notes?: string;
    // Add fields for property details if backend fetches them
    PropertyTitle?: string;
    PropertyAddress?: string;
    ClientName?: string; // Add if backend provides
}

// Interface for confirmed appointments (can be same as Requested)
type ConfirmedAppointment = RequestedAppointment;

// Interface for properties managed by the agent
interface MyListing {
    PropertyID: string;
    Title: string;
    Address: string;
    City: string;
    Status: string; // e.g., Active, PendingReview, Sold
    imageUrls: string[]; // Thumbnail
    // Add other relevant fields if needed, e.g., Price, ViewCount
}

const AgentDashboard: React.FC = () => {
    const { userId, token, userType } = useAuth(); // Make sure userId is available if needed, token is crucial
    const { toast } = useToast();
    const [unassignedProperties, setUnassignedProperties] = useState<UnassignedProperty[]>([]);
    const [appointments, setAppointments] = useState<RequestedAppointment[]>([]);
    const [confirmedAppointments, setConfirmedAppointments] = useState<ConfirmedAppointment[]>([]);
    const [myListings, setMyListings] = useState<MyListing[]>([]); // Agent's listings
    const [isLoadingProperties, setIsLoadingProperties] = useState(true);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [isLoadingConfirmedAppointments, setIsLoadingConfirmedAppointments] = useState(true);
    const [isLoadingMyListings, setIsLoadingMyListings] = useState(true); // Loading state for my listings
    const [claimingPropertyId, setClaimingPropertyId] = useState<string | null>(null);
    const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
    const [updatingAppointmentStatus, setUpdatingAppointmentStatus] = useState<'Confirmed' | 'Cancelled' | null>(null);

    // State for Filters/Sorting
    const [propertySearch, setPropertySearch] = useState('');
    const [propertySort, setPropertySort] = useState('newest'); // e.g., 'newest', 'oldest', 'city'
    const [appointmentSearch, setAppointmentSearch] = useState('');
    const [appointmentSort, setAppointmentSort] = useState('soonest'); // e.g., 'soonest', 'latest', 'property'

    // --- Fetching Functions (using useCallback for stability) ---

    const fetchUnassigned = useCallback(async () => {
        console.log("Fetching unassigned properties...");
        setIsLoadingProperties(true);
        try {
            const response = await axios.get('/api/properties/unassigned', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Unassigned properties response:", response.data);
            setUnassignedProperties(response.data.properties || []);
        } catch (error) {
            console.error("Error fetching unassigned properties:", error);
            toast({
                title: "Error Loading Properties",
                description: "Could not fetch unassigned properties.",
                variant: "destructive",
            });
             setUnassignedProperties([]); // Clear on error
        } finally {
            setIsLoadingProperties(false);
        }
    }, [token, toast]);

    const fetchAppointments = useCallback(async () => {
         console.log("Fetching pending agent appointments...");
        setIsLoadingAppointments(true);
        try {
            // Assuming backend returns only 'Requested' or we filter here
            const response = await axios.get('/api/appointments/agent', {
                headers: { Authorization: `Bearer ${token}` },
                // Optionally add params: { status: 'Requested' } if backend supports it
            });
             console.log("Pending Agent appointments response:", response.data);
            // Filter for 'Requested' status on the client side if necessary
            const requested = (response.data.appointments || []).filter((appt: RequestedAppointment) => appt.Status === 'Requested');
            setAppointments(requested);
        } catch (error) {
            console.error("Error fetching pending appointments:", error);
            toast({
                title: "Error Loading Appointments",
                description: "Could not fetch appointment requests.",
                variant: "destructive",
            });
            setAppointments([]); // Clear on error
        } finally {
            setIsLoadingAppointments(false);
        }
    }, [token, toast]);

    // Fetch Confirmed Appointments for Schedule
    const fetchConfirmedAppointments = useCallback(async () => {
        console.log("Fetching confirmed agent appointments...");
        setIsLoadingConfirmedAppointments(true);
        try {
            // Assume backend supports filtering by status
            const response = await axios.get('/api/appointments/agent', {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'Confirmed' } // Add status parameter
            });
            console.log("Confirmed agent appointments response:", response.data);
            setConfirmedAppointments(response.data.appointments || []);
        } catch (error) {
            console.error("Error fetching confirmed appointments:", error);
            toast({
                title: "Error Loading Schedule",
                description: "Could not fetch your confirmed appointments.",
                variant: "destructive",
            });
            setConfirmedAppointments([]); // Clear on error
        } finally {
            setIsLoadingConfirmedAppointments(false);
        }
    }, [token, toast]);

    // Fetch Agent's Listings
    const fetchMyListings = useCallback(async () => {
        console.log("Fetching agent's listings...");
        setIsLoadingMyListings(true);
        try {
            // Update the endpoint to the newly created one
            const response = await axios.get('/api/properties/agent/listings', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Agent's listings response:", response.data);
            setMyListings(response.data.properties || []);
        } catch (error) {
            console.error("Error fetching agent's listings:", error);
            toast({
                title: "Error Loading My Listings",
                description: "Could not fetch your managed properties.",
                variant: "destructive",
            });
            setMyListings([]); // Clear on error
        } finally {
            setIsLoadingMyListings(false);
        }
    }, [token, toast]);

    // --- Initial Data Fetching ---
    useEffect(() => {
        if (token && userType === 'Agent') {
            console.log("AgentDashboard: Fetching data...");
            fetchUnassigned();
            fetchAppointments(); // Fetches Pending
            fetchConfirmedAppointments(); // Fetches Confirmed
            fetchMyListings(); // Fetch agent's listings
        } else if (token && userType !== 'Agent') {
            console.log("AgentDashboard: User authenticated but not an Agent.");
            setIsLoadingProperties(false);
            setIsLoadingAppointments(false);
            setIsLoadingConfirmedAppointments(false); // Set schedule loading false
            setIsLoadingMyListings(false); // Set my listings loading false
        } else {
             console.log("AgentDashboard: No token or userType !== Agent.");
             setIsLoadingProperties(false);
             setIsLoadingAppointments(false);
             setIsLoadingConfirmedAppointments(false); // Set schedule loading false
             setIsLoadingMyListings(false); // Set my listings loading false
        }
    }, [token, userType, fetchUnassigned, fetchAppointments, fetchConfirmedAppointments, fetchMyListings]); // Add fetchConfirmedAppointments and fetchMyListings dependencies

    // --- Handler Functions ---

    const handleClaimProperty = async (propertyId: string) => {
        if (claimingPropertyId) return;
        setClaimingPropertyId(propertyId);
        console.log(`Attempting to claim property ${propertyId}`);
        try {
            const response = await axios.put(`/api/properties/${propertyId}/claim`,
             {},
             {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Claim response for ${propertyId}:`, response.data);
            toast({ title: "Success", description: response.data.message || "Property claimed successfully! Awaiting review." });
            // Refetch the list instead of optimistic update for review process
            fetchUnassigned();
            // TODO: Optionally trigger a fetch for "My Listings" section later
        } catch (error: any) {
            console.error(`Error claiming property ${propertyId}:`, error);
            toast({
                title: "Claim Failed",
                description: error.response?.data?.message || "Could not claim property. It might have been claimed already.",
                variant: "destructive",
            });
             // Re-fetch unassigned properties in case of conflicts
             fetchUnassigned();
        } finally {
            setClaimingPropertyId(null);
        }
    };

    const handleUpdateAppointment = async (appointmentId: string, newStatus: 'Confirmed' | 'Cancelled') => {
        if (updatingAppointmentId) return;
        setUpdatingAppointmentId(appointmentId);
        setUpdatingAppointmentStatus(newStatus);
        console.log(`Attempting to update appointment ${appointmentId} to ${newStatus}`);
        try {
            const response = await axios.put(`/api/appointments/${appointmentId}`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log(`Update response for ${appointmentId}:`, response.data);
            toast({ title: "Success", description: `Appointment ${newStatus.toLowerCase()} successfully.` });
            // Remove updated appointment from the 'Requested' list
            setAppointments(prev => prev.filter(a => a.AppointmentID !== appointmentId));
            // If confirmed, refetch the confirmed list for the schedule
            if (newStatus === 'Confirmed') {
                fetchConfirmedAppointments();
            }
        } catch (error: any) {
            console.error(`Error updating appointment ${appointmentId}:`, error);
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Could not update appointment status.",
                variant: "destructive",
            });
        } finally {
            setUpdatingAppointmentId(null);
            setUpdatingAppointmentStatus(null);
        }
    };

    // --- Render Functions ---

    const renderDate = (isoString: string | undefined): string => {
        if (!isoString) return "N/A";
        try {
            return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch { return "Invalid Date"; }
    };
    
    const renderTime = (isoString: string | undefined): string => {
        if (!isoString) return "N/A";
        try {
            return new Date(isoString).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        } catch { return "Invalid Time"; }
    };

    // Filter and sort logic (memoized)
    const filteredUnassignedProperties = useMemo(() => {
        return unassignedProperties
            .filter(prop =>
                prop.PropertyID.toLowerCase().includes(propertySearch.toLowerCase()) ||
                prop.Title.toLowerCase().includes(propertySearch.toLowerCase()) ||
                prop.Address.toLowerCase().includes(propertySearch.toLowerCase()) ||
                prop.City.toLowerCase().includes(propertySearch.toLowerCase())
            )
            .sort((a, b) => {
                switch (propertySort) {
                    case 'oldest':
                        return new Date(a.CreationDate).getTime() - new Date(b.CreationDate).getTime();
                    case 'city':
                        return a.City.localeCompare(b.City);
                    case 'newest':
                    default:
                        return new Date(b.CreationDate).getTime() - new Date(a.CreationDate).getTime();
                }
            });
    }, [unassignedProperties, propertySearch, propertySort]);

    const filteredAppointments = useMemo(() => {
        return appointments // Filter pending appointments
            .filter(appt =>
                appt.PropertyID.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                appt.ClientID.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                (appt.PropertyTitle || '').toLowerCase().includes(appointmentSearch.toLowerCase())
            )
             .sort((a, b) => {
                switch (appointmentSort) {
                    case 'latest':
                        return new Date(b.RequestedDateTime).getTime() - new Date(a.RequestedDateTime).getTime();
                    case 'soonest':
                    default:
                        return new Date(a.RequestedDateTime).getTime() - new Date(b.RequestedDateTime).getTime();
                }
            });
    }, [appointments, appointmentSearch, appointmentSort]);

    // --- Render Functions for UI Components ---

    const renderUnassignedProperties = () => {
        if (isLoadingProperties) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            );
        }
        if (filteredUnassignedProperties.length === 0) {
            return <p className="text-gray-500 italic">No unassigned properties found matching your search.</p>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUnassignedProperties.map(prop => (
                    <Card key={prop.PropertyID} className="flex flex-row gap-4 p-4 items-start">
                        <img 
                            src={prop.imageUrls?.[0] || 'https://placehold.co/100x100?text=No+Img'}
                            alt={prop.Title}
                            className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100?text=No+Img'; }}
                        />
                        <div className="flex-grow">
                            <h4 className="font-medium text-base mb-1">{prop.Title}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                                <MapPin size={14} className="text-gray-500"/> {prop.Address}, {prop.City}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Calendar size={12} className="text-gray-500"/> Listed: {renderDate(prop.CreationDate)}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClaimProperty(prop.PropertyID)}
                            disabled={claimingPropertyId === prop.PropertyID}
                            className="flex-shrink-0"
                        >
                            {claimingPropertyId === prop.PropertyID ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Claim'}
                        </Button>
                    </Card>
                ))}
            </div>
        );
    };

    const renderAppointments = () => {
        if (isLoadingAppointments) {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            );
        }
        if (filteredAppointments.length === 0) {
            return <p className="text-gray-500 italic">No pending appointment requests found matching your search.</p>;
        }

        return (
             <div className="space-y-4">
                {filteredAppointments.map(appt => (
                    <Card key={appt.AppointmentID} className="flex flex-col md:flex-row gap-4 p-4 items-start hover:shadow-md transition-shadow duration-200">
                        <div className="flex-grow">
                             <h4 className="font-medium text-base mb-2">{appt.Type || 'Appointment Request'}</h4>
                             <p className="text-sm text-gray-700 flex items-center gap-1.5 mb-1">
                                <Home size={14} className="text-gray-500"/>
                                Property: 
                                <Link 
                                    to={`/properties/${appt.PropertyID}/${appt.PropertyTitle?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'details'}`}
                                    className="text-primary hover:underline font-medium"
                                >
                                    {appt.PropertyTitle || appt.PropertyID}
                                </Link>
                             </p>
                             <p className="text-sm text-gray-700 flex items-center gap-1.5 mb-2">
                                <User size={14} className="text-gray-500"/>
                                Client: <span className="font-medium">{appt.ClientName || appt.ClientID}</span>
                             </p>
                             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Calendar size={14} className="text-gray-500"/> {renderDate(appt.RequestedDateTime)}
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Clock size={14} className="text-gray-500"/> {renderTime(appt.RequestedDateTime)}
                                </span>
                            </div>
                            {appt.Notes && (
                                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md italic border">
                                    Notes: {appt.Notes}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0 mt-2 md:mt-0">
                             <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleUpdateAppointment(appt.AppointmentID, 'Cancelled')}
                                disabled={updatingAppointmentId === appt.AppointmentID}
                                className="w-full sm:w-auto md:w-24"
                             >
                                 {updatingAppointmentId === appt.AppointmentID && updatingAppointmentStatus === 'Cancelled' ? (
                                     <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                     <><X size={16} className="mr-1"/>Decline</>
                                 )}
                             </Button>
                             <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => handleUpdateAppointment(appt.AppointmentID, 'Confirmed')}
                                disabled={updatingAppointmentId === appt.AppointmentID}
                                className="w-full sm:w-auto md:w-24 bg-green-600 hover:bg-green-700"
                             >
                                  {updatingAppointmentId === appt.AppointmentID && updatingAppointmentStatus === 'Confirmed' ? (
                                     <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                     <><Check size={16} className="mr-1"/>Confirm</>
                                 )}
                             </Button>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    const renderMySchedule = () => {
        if (isLoadingConfirmedAppointments) {
            return <Skeleton className="h-24 w-full" />;
        }
        if (confirmedAppointments.length === 0) {
            return <p className="text-gray-500 italic">No confirmed appointments in your schedule.</p>;
        }

        // Simple sort by date for now
        const sortedAppointments = [...confirmedAppointments].sort((a, b) => 
            new Date(a.RequestedDateTime).getTime() - new Date(b.RequestedDateTime).getTime()
        );

        return (
            <div className="space-y-4">
                {sortedAppointments.map(appt => (
                    <Card key={appt.AppointmentID} className="p-4 hover:shadow-md transition-shadow duration-200">
                         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                             <div className="flex-shrink-0 text-center p-2 rounded-md bg-primary/10 w-full sm:w-auto">
                                 <p className="text-sm font-medium text-primary uppercase">{new Date(appt.RequestedDateTime).toLocaleDateString(undefined, { month: 'short' })}</p>
                                 <p className="text-2xl font-bold text-primary">{new Date(appt.RequestedDateTime).getDate()}</p>
                             </div>
                             <div className="flex-grow">
                                <p className="font-semibold text-base mb-1">
                                     {appt.Type || 'Appointment'}
                                     {appt.PropertyTitle && ` at ${appt.PropertyTitle}`}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                                    <Clock size={14} className="text-gray-500"/>
                                    {renderTime(appt.RequestedDateTime)}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                                     <User size={14} className="text-gray-500"/>
                                     Client: {appt.ClientName || appt.ClientID}
                                 </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                     <Home size={14} className="text-gray-500"/>
                                     Property: <Link to={`/properties/${appt.PropertyID}/details`} className="text-primary hover:underline">{appt.PropertyTitle || appt.PropertyID}</Link>
                                 </p>
                             </div>
                         </div>
                         {appt.Notes && (
                             <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100 italic">
                                 Notes: {appt.Notes}
                             </p>
                         )}
                    </Card>
                ))}
            </div>
        );
    };

    const renderMyListings = () => {
        if (isLoadingMyListings) {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-60 w-full" />
                    <Skeleton className="h-60 w-full" />
                    <Skeleton className="h-60 w-full" />
                </div>
            );
        }
        if (myListings.length === 0) {
            return <p className="text-gray-500 italic">You currently have no listings assigned to you.</p>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map(listing => (
                    <Card key={listing.PropertyID} className="overflow-hidden">
                        <Link to={`/properties/${listing.PropertyID}/details`} className="block">
                            <div className="aspect-video relative bg-gray-200">
                                <img 
                                    src={listing.imageUrls?.[0] || 'https://placehold.co/600x400?text=No+Img'}
                                    alt={listing.Title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400?text=No+Img'; }}
                                />
                                <div className={`absolute top-0 right-0 m-2 px-2 py-1 rounded text-xs text-white ${
                                     listing.Status === 'Active' ? 'bg-green-600' : 
                                     listing.Status === 'Pending' ? 'bg-yellow-600' : 
                                     listing.Status === 'Sold' ? 'bg-red-600' : 'bg-gray-500'
                                 }`}>
                                    {listing.Status}
                                </div>
                            </div>
                        </Link>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-base mb-1 truncate">
                                <Link to={`/properties/${listing.PropertyID}/details`} className="hover:underline">
                                    {listing.Title}
                                </Link>
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5 truncate">
                                <MapPin size={14} className="text-gray-500"/> {listing.Address}, {listing.City}
                            </p>
                            {/* Add more details or actions here if needed */}
                            <div className="mt-3 flex justify-end">
                               <Link to={`/edit-property/${listing.PropertyID}`}> 
                                  <Button variant="outline" size="sm">Manage</Button>
                               </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    // Main component render
    if (userType !== 'Agent') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Denied</CardTitle>
                            <CardDescription>This dashboard is only accessible to registered agents.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Section 1: Available Properties to Claim */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Properties</CardTitle>
                        <CardDescription>Properties submitted by clients that need an agent.</CardDescription>
                         <div className="flex gap-4 mt-4">
                            <Input 
                                placeholder="Search by Title, Address, City..."
                                value={propertySearch}
                                onChange={(e) => setPropertySearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={propertySort} onValueChange={setPropertySort}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Date: Newest</SelectItem>
                                    <SelectItem value="oldest">Date: Oldest</SelectItem>
                                    <SelectItem value="city">City</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {renderUnassignedProperties()}
                    </CardContent>
                </Card>

                 {/* Section 2: My Listings */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Listings</CardTitle>
                        <CardDescription>Properties you are currently managing.</CardDescription>
                        {/* Add search/sort for My Listings if needed */}
                    </CardHeader>
                    <CardContent>
                         {renderMyListings()}
                    </CardContent>
                </Card>

                 {/* Section 3: Pending Appointments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Appointments</CardTitle>
                        <CardDescription>Client requests requiring confirmation.</CardDescription>
                        <div className="flex gap-4 mt-4">
                            <Input 
                                placeholder="Search by Property ID, Client ID..."
                                value={appointmentSearch}
                                onChange={(e) => setAppointmentSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={appointmentSort} onValueChange={setAppointmentSort}>
                                <SelectTrigger className="w-[180px]">
                                    <ListFilter size={16} className="mr-2"/>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="soonest">Date: Soonest</SelectItem>
                                    <SelectItem value="latest">Date: Latest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {renderAppointments()}
                    </CardContent>
                </Card>

                {/* Section 4: My Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Schedule</CardTitle>
                        <CardDescription>Your confirmed upcoming appointments.</CardDescription>
                         {/* Add search/sort/filter for Schedule if needed */}
                    </CardHeader>
                    <CardContent>
                         {renderMySchedule()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AgentDashboard;