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

const Profile = () => {
  const { isAuthenticated, token, userId, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/users/profile', {
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
        'http://localhost:3001/api/users/upload-id-document',
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
      });

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        {userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Information */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your basic account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="font-medium">{userProfile.name}</div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="font-medium">{userProfile.email}</div>
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="font-medium">{userProfile.userType}</div>
                </div>
                <div className="space-y-2">
                  <Label>Verification Status</Label>
                  <div className="font-medium">
                    {userProfile.IsVerified ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ID Verification */}
            <Card>
              <CardHeader>
                <CardTitle>ID Verification</CardTitle>
                <CardDescription>
                  Upload your identification document to verify your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile.IsVerified ? (
                  <div className="text-green-600">
                    Your account is verified. Document has been uploaded.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="idDocument">Select ID Document</Label>
                      <Input
                        id="idDocument"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <p className="text-sm text-gray-500">
                        Accepted formats: JPG, PNG, or PDF. Max 5MB.
                      </p>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={!uploadFile || uploading}
                      className="w-full"
                    >
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 