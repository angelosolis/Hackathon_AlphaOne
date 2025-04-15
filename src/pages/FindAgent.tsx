import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserCircle, MessageSquare, Star } from 'lucide-react';

// Interface matching the projected data from the backend
interface PublicAgentProfile {
  UserID: string;
  name: string;
  ProfileImageURL?: string;
  Bio?: string;
  Specializations?: string[];
  ServiceAreas?: string[];
  ExperienceYears?: number;
  AgencyName?: string;
  // Add aggregate review data later if needed
  // averageRating?: number;
  // reviewCount?: number;
}

const FindAgent = () => {
  const [agents, setAgents] = useState<PublicAgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:3001/api/users/agents/public');
        setAgents(response.data.agents || []);
      } catch (err: any) {
        console.error("Error fetching agents:", err);
        setError(err.response?.data?.message || 'Failed to load agents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const truncateBio = (bio: string | undefined, maxLength = 100) => {
    if (!bio) return 'No bio available.';
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Find an Agent</h1>
        
        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading agents...</span>
          </div>
        )}

        {error && (
           <div className="text-center py-10">
             <p className="text-red-600 dark:text-red-400">Error: {error}</p>
           </div>
        )}

        {!loading && !error && agents.length === 0 && (
           <div className="text-center py-10">
             <p className="text-muted-foreground">No verified agents found at this time.</p>
           </div>
        )}

        {!loading && !error && agents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.UserID} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                   <Avatar className="h-16 w-16 border">
                       <AvatarImage src={agent.ProfileImageURL || undefined} alt={agent.name} />
                       <AvatarFallback>
                           <UserCircle className="h-full w-full text-gray-400" />
                       </AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                     <CardTitle className="text-xl">{agent.name}</CardTitle>
                     <CardDescription>{agent.AgencyName || 'Independent Agent'}</CardDescription>
                     {/* Optionally add years experience or rating here */}
                     {/* <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" /> 4.8 (15 reviews)
                     </div> */}
                   </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                   <p className="text-sm text-muted-foreground min-h-[60px]">{truncateBio(agent.Bio)}</p>
                   
                   {agent.Specializations && agent.Specializations.length > 0 && (
                       <div>
                           <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Specializations</h4>
                           <div className="flex flex-wrap gap-1">
                               {agent.Specializations.map((spec, i) => <Badge key={i} variant="secondary">{spec}</Badge>)}
                           </div>
                       </div>
                   )}
                    {agent.ServiceAreas && agent.ServiceAreas.length > 0 && (
                       <div>
                           <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Service Areas</h4>
                           <div className="flex flex-wrap gap-1">
                               {agent.ServiceAreas.map((area, i) => <Badge key={i} variant="outline">{area}</Badge>)}
                           </div>
                       </div>
                   )}
                </CardContent>
                <CardFooter className="pt-4 border-t">
                   <div className="flex w-full gap-2">
                       {/* Link to future detailed agent profile page */}
                       <Link to={`/agent/${agent.UserID}`} className="flex-1">
                           <Button variant="outline" className="flex-1">View Profile</Button>
                       </Link>
                       <Link to={`/chat?recipientId=${agent.UserID}`} className="flex-1"> {/* Link to chat */} 
                           <Button className="w-full"><MessageSquare className="mr-2 h-4 w-4"/> Contact</Button>
                       </Link>
                   </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindAgent; 