import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCircle, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ENDPOINTS } from '../config/api'; // Import the API endpoints

// Define a more specific type for user profile
interface UserProfile {
  UserID: string;
  name: string;
  email: string;
  userType: 'Client' | 'Agent' | 'Buyer' | 'Seller' | 'Developer';
  IsVerified?: boolean;
  IdDocumentS3Key?: string;
  ProfileImageURL?: string;
  // Agent specific fields (optional)
  Bio?: string;
  Specializations?: string[];
  ServiceAreas?: string[];
  ExperienceYears?: number;
  LicenseNumber?: string;
  AgencyName?: string;
  // Client specific fields (optional)
  Income?: number;
  CreditScore?: number;
  Budget?: number;
  PreferredLocation?: string[];
  PreferredPropertyType?: string[];
  PreferredBedrooms?: number;
  PreferredBathrooms?: number;
  EmploymentStatus?: string;
  EmploymentVerified?: boolean;
  // Add other common fields if needed
  Phone?: string;
  CreationDate?: string;
  LastActive?: string;
}

const Profile = () => {
  const { isAuthenticated, token, userId, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- Face Verification State ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<File | null>(null);
  const [capturedSelfiePreview, setCapturedSelfiePreview] = useState<string | null>(null);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{success: boolean, message: string} | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null); // To keep track of the stream
  // --- End Face Verification State ---

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.USER_PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserProfile(response.data);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to fetch profile data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, token, navigate, toast]);

  // --- Cleanup camera stream on unmount / when camera deactivated --- 
  useEffect(() => {
    // This cleanup runs when isCameraActive becomes false or component unmounts
    return () => {
      stopCameraStream(); 
    };
  }, []); // Keep empty dependency array for unmount cleanup

  // --- Effect to Start Camera Stream AFTER element is rendered ---
  useEffect(() => {
    const initializeCamera = async () => {
        if (isCameraActive && videoRef.current && !streamRef.current) { // Only run if active, ref exists, and stream isn't already set
            console.log("useEffect: Camera active and ref ready. Getting stream...");
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360, facingMode: 'user' } });
                console.log("useEffect: Stream obtained:", stream);
                if (videoRef.current) { // Double-check ref just in case
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream; // Store stream reference
                    console.log("useEffect: srcObject assigned.");
                } else {
                    console.error("useEffect: videoRef became null unexpectedly.");
                    stream.getTracks().forEach(track => track.stop()); // Stop stream if ref is lost
                }
            } catch (err) {
                console.error("useEffect: Error accessing camera: ", err);
                toast({ title: 'Camera Error', description: 'Could not access camera. Check permissions or hardware.', variant: 'destructive' });
                setIsCameraActive(false); // Turn off camera state if permission fails
            }
        }
    };

    initializeCamera();

    // Cleanup function specifically for when isCameraActive changes back to false
    // return () => {
    //     if (!isCameraActive) {
    //         console.log("useEffect cleanup: isCameraActive is false, stopping stream.");
    //         stopCameraStream();
    //     }
    // };
    
  }, [isCameraActive, toast]); // Re-run when isCameraActive changes

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('idDocument', uploadFile);

      const response = await axios.post(
        ENDPOINTS.UPLOAD_ID_DOCUMENT,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update user profile state with new verification status
      setUserProfile({
        ...userProfile,
        IsVerified: response.data.userStatus.isVerified,
        IdDocumentS3Key: response.data.userStatus.documentKey
      } as UserProfile);

      toast({
        title: 'Success',
        description: 'ID document uploaded successfully. Your account is now verified.'
      });

      setUploadFile(null);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // --- Profile Image Handlers ---
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setProfileImageFile(file);
        // Create a preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        }
        reader.readAsDataURL(file);
    } else {
        setProfileImageFile(null);
        setImagePreview(null);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!profileImageFile) {
        toast({ title: 'Error', description: 'Please select an image file first.', variant: 'destructive' });
        return;
    }

    setUploadingProfileImage(true);
    const formData = new FormData();
    formData.append('profileImage', profileImageFile);

    try {
        const response = await axios.post(
            ENDPOINTS.USER_PROFILE_IMAGE, 
            formData, 
            {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            }
        );

        // Update profile state with the new URL
        setUserProfile(prev => prev ? { ...prev, ProfileImageURL: response.data.profileImageUrl } : null);

        toast({ title: 'Success', description: 'Profile image updated successfully.' });
        setProfileImageFile(null); // Reset file input
        setImagePreview(null); // Reset preview

    } catch (error: any) {
        console.error('Error uploading profile image:', error);
        toast({ title: 'Upload Failed', description: error.response?.data?.message || 'Failed to upload profile image', variant: 'destructive' });
    } finally {
        setUploadingProfileImage(false);
    }
  };
  // --- End Profile Image Handlers ---

  // --- Face Verification Handlers ---
  const handleStartCameraClick = () => {
      console.log("handleStartCameraClick: Setting isCameraActive to true.");
      setIsCameraActive(true);
      setCapturedSelfie(null); // Reset previous captures
      setCapturedSelfiePreview(null);
      setVerificationResult(null);
  };

  // Combined stop and state reset
  const stopCameraAndReset = () => {
      stopCameraStream(); // Stops hardware stream
      setIsCameraActive(false); // Triggers useEffect cleanup if needed, ensures UI hides video
  }

  const stopCameraStream = () => {
    if (streamRef.current) {
        console.log("Stopping camera stream...");
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        //setIsCameraActive(false); // Don't set state here, let caller decide
    } else {
        // console.log("stopCameraStream called but no active stream found.");
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert canvas to Blob, then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const selfieFile = new File([blob], "selfie.png", { type: "image/png" });
            setCapturedSelfie(selfieFile);
            setCapturedSelfiePreview(canvas.toDataURL('image/png'));
            stopCameraAndReset(); // Stop camera and hide video after capture
          }
        }, 'image/png');
      }
    }
  };

  const handleRetake = () => {
      setCapturedSelfie(null);
      setCapturedSelfiePreview(null);
      setVerificationResult(null);
      handleStartCameraClick(); // Restart camera immediately
  }

  const handleFaceVerificationSubmit = async () => {
      if (!capturedSelfie) {
          toast({ title: 'Error', description: 'Please capture a selfie first.', variant: 'destructive' });
          return;
      }

      setVerifyingFace(true);
      setVerificationResult(null);
      const formData = new FormData();
      formData.append('selfieImage', capturedSelfie);

      try {
          const response = await axios.post(
              ENDPOINTS.VERIFY_FACE, 
              formData, 
              {
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
              }
          );
          
          setVerificationResult({success: response.data.success, message: response.data.message});
          
          // If successful, update the main profile state to reflect verification
          if(response.data.success) {
             setUserProfile(prev => prev ? { ...prev, IsVerified: true } : null);
          }
          
          toast({ title: 'Verification Attempted', description: response.data.message, variant: response.data.success ? 'default' : 'destructive' });

      } catch (error: any) {
          console.error('Error during face verification:', error);
          const errorMsg = error.response?.data?.message || 'Failed to verify face.';
          setVerificationResult({success: false, message: errorMsg});
          toast({ title: 'Verification Failed', description: errorMsg, variant: 'destructive' });
      } finally {
          setVerifyingFace(false);
      }
  };
  // --- End Face Verification Handlers ---

  // Utility function to display profile data or a placeholder
  const displayData = (data: string | number | undefined | null, placeholder = "N/A") => {
    return data !== undefined && data !== null && data !== '' ? data : placeholder;
  };

  if (loading) {
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {userProfile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Column 1: Profile Pic, Basic Info, ID Verification, Face Verification */}
            <div className="lg:col-span-1 space-y-8">
              {/* Profile Picture Card */}
              <Card>
                 <CardHeader>
                     <CardTitle>Profile Picture</CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center space-y-4">
                     <Avatar className="h-32 w-32">
                         <AvatarImage src={imagePreview || userProfile.ProfileImageURL || undefined} alt={userProfile.name} />
                         <AvatarFallback>
                             <UserCircle className="h-full w-full text-gray-400" />
                         </AvatarFallback>
                     </Avatar>
                    <Input
                        id="profileImageInput"
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleProfileImageChange}
                        className="text-sm"
                        disabled={uploadingProfileImage}
                    />
                    <Button
                        onClick={handleProfileImageUpload}
                        disabled={!profileImageFile || uploadingProfileImage}
                        className="w-full"
                        size="sm"
                    >
                       {uploadingProfileImage ? (
                           <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                       ) : (
                           'Upload New Image'
                       )}
                    </Button>
                 </CardContent>
              </Card>

              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-muted-foreground">Name</Label>
                    <div className="font-medium text-right">{displayData(userProfile.name)}</div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="font-medium text-right">{displayData(userProfile.email)}</div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Label className="text-muted-foreground">Account Type</Label>
                    <div className="font-medium text-right">{displayData(userProfile.userType)}</div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="font-medium text-right">
                      {userProfile.IsVerified ? (
                        <Badge variant="secondary">Verified</Badge>
                      ) : (
                        <Badge variant="destructive">Unverified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ID Verification Card (REMOVED) */}
              {/* Face Verification Card (REMOVED) */}

               {/* Add Verification Link/Button if not verified */}
               {!userProfile.IsVerified && (
                 <Card>
                    <CardHeader>
                       <CardTitle>Account Verification</CardTitle>
                       <CardDescription>Verify your identity to unlock all features.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <Link to="/verify">
                        <Button variant="outline" size="sm">Verify ID Document</Button>
                      </Link>
                    </CardContent>
                 </Card>
               )}
            </div>

            {/* Column 2: Agent Profile (Conditional) */}
            {userProfile.userType === 'Agent' && (
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                      <CardTitle>Agent Profile</CardTitle>
                      <CardDescription>Your public-facing agent information.</CardDescription>
                    </div>
                    <Link to="/profile/agent/edit">
                      <Button variant="outline" size="sm">Edit Profile</Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                      <p className="mt-1 text-sm whitespace-pre-line">{displayData(userProfile.Bio, "No bio provided.")}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Specializations</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(userProfile.Specializations && userProfile.Specializations.length > 0) ? (
                          userProfile.Specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary">{spec}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No specializations listed.</p>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Service Areas</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(userProfile.ServiceAreas && userProfile.ServiceAreas.length > 0) ? (
                          userProfile.ServiceAreas.map((area, index) => (
                            <Badge key={index} variant="secondary">{area}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No service areas listed.</p>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Years of Experience</Label>
                        <p className="mt-1 text-sm">{displayData(userProfile.ExperienceYears)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">License Number</Label>
                        <p className="mt-1 text-sm">{displayData(userProfile.LicenseNumber)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Agency Name</Label>
                        <p className="mt-1 text-sm">{displayData(userProfile.AgencyName)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="mt-1 text-sm">{displayData(userProfile.Phone)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Column 2: Client Profile (Conditional) */}
            {userProfile.userType === 'Client' && (
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                      <CardTitle>Financial Profile</CardTitle>
                      <CardDescription>
                        This information helps us find properties within your budget and preferences.
                        {!userProfile.EmploymentVerified && (
                          <Badge variant="outline" className="ml-2 bg-yellow-100">Pending Verification</Badge>
                        )}
                      </CardDescription>
                    </div>
                    <Link to="/edit-client-profile">
                      <Button variant="outline" size="sm">Edit Profile</Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Monthly Income</Label>
                      <p className="mt-1 text-sm">
                        {userProfile.Income 
                          ? `₱${userProfile.Income.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Credit Score</Label>
                      <p className="mt-1 text-sm">{displayData(userProfile.CreditScore)}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Property Budget</Label>
                      <p className="mt-1 text-sm">
                        {userProfile.Budget 
                          ? `₱${userProfile.Budget.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Employment Status</Label>
                      <p className="mt-1 text-sm">{displayData(userProfile.EmploymentStatus)}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Housing Preferences</Label>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Preferred Locations:</span>
                          <div className="flex flex-wrap justify-end gap-1">
                            {userProfile.PreferredLocation && userProfile.PreferredLocation.length > 0 ? (
                              userProfile.PreferredLocation.map((loc, i) => (
                                <Badge key={i} variant="secondary">{loc}</Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Any</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Property Types:</span>
                          <div className="flex flex-wrap justify-end gap-1">
                            {userProfile.PreferredPropertyType && userProfile.PreferredPropertyType.length > 0 ? (
                              userProfile.PreferredPropertyType.map((type, i) => (
                                <Badge key={i} variant="secondary">{type}</Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Any</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Bedrooms:</span>
                          <span>{displayData(userProfile.PreferredBedrooms, 'Any')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Bathrooms:</span>
                          <span>{displayData(userProfile.PreferredBathrooms, 'Any')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 dark:bg-gray-900/50 p-4">
                    <div className="w-full text-sm text-muted-foreground">
                      <p className="mb-2">
                        <strong>Why provide this information?</strong>
                      </p>
                      <p>
                        Your financial profile helps us find properties that match your budget and preferences.
                        It also enables agents to better understand your needs and pre-qualify you for viewings.
                      </p>
                      {!userProfile.EmploymentVerified && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Employment Verification:</span>
                            <Link to="/verify-employment">
                              <Button variant="outline" size="sm">Verify Now</Button>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 