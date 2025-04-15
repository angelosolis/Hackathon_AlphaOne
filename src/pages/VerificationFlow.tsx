import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, CheckCircle, XCircle, FileCheck, UserCheck, HelpCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ENDPOINTS } from '../config/api'; // Import API endpoints
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const VerificationFlow = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1); // 1: Upload ID, 2: Capture Selfie, 3: Result
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState(false);
  const [idUploadSuccess, setIdUploadSuccess] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<File | null>(null);
  const [capturedSelfiePreview, setCapturedSelfiePreview] = useState<string | null>(null);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{success: boolean, message: string} | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // --- Step 1: ID Upload Handlers ---
  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleIdUpload = async () => {
    if (!idFile) {
      toast({ title: 'Error', description: 'Please select an ID file.', variant: 'destructive' });
      return;
    }
    setUploadingId(true);
    const formData = new FormData();
    formData.append('idDocument', idFile);

    try {
      await axios.post(ENDPOINTS.UPLOAD_ID_DOCUMENT, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast({ title: 'Step 1 Complete', description: 'ID document uploaded successfully.' });
      setIdUploadSuccess(true);
      setCurrentStep(2); // Move to next step
    } catch (error: any) {
      console.error('Error uploading ID document:', error);
      toast({ title: 'ID Upload Failed', description: error.response?.data?.message || 'Failed to upload ID', variant: 'destructive' });
    } finally {
      setUploadingId(false);
    }
  };

  const checkCameraPermissions = async () => {
    try {
      // Check if browser is Chrome
      const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
      
      // First check if the browser supports the permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        // Special handling for Chrome
        if (isChrome && permissionStatus.state === 'prompt') {
          toast({ 
            title: 'Camera Permission Required', 
            description: 'Please allow camera access when prompted by Chrome.', 
          });
        }
        
        if (permissionStatus.state === 'denied') {
          toast({ 
            title: 'Camera Permission Denied', 
            description: 'Please enable camera access in your browser settings and try again.', 
            variant: 'destructive' 
          });
          return false;
        }
        
        // Set up listener for permission changes
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            // If permission is granted after initially being denied
            toast({ title: 'Camera Access Granted', description: 'You can now use the camera feature.' });
          }
        };
      }
      
      // If permissions API not supported or permission not denied, try to access camera
      return true;
    } catch (err) {
      console.error("Error checking camera permissions: ", err);
      return true; // Proceed anyway and let getUserMedia handle the error
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ title: 'Error', description: 'Camera access is not supported by your browser.', variant: 'destructive' });
      return;
    }
    
    // Check permissions first
    const permissionGranted = await checkCameraPermissions();
    if (!permissionGranted) return;
    
    setIsCameraActive(true);
    setCapturedSelfie(null); 
    setCapturedSelfiePreview(null);
    setVerificationResult(null);
    
    try {
      // For Chrome on Android, explicitly set ideal facing mode
      const constraints = { 
        video: { 
          width: 480, 
          height: 360, 
          facingMode: 'user',
          // Add advanced constraints for better performance on Chrome
          advanced: [
            { frameRate: 15 }, // Lower frame rate for better performance
          ]
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } else {
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err: any) {
      console.error("Error accessing camera: ", err);
      
      // Provide more specific error messages based on the error name
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast({ 
          title: 'Camera Permission Denied', 
          description: 'Access to your camera was blocked. Please check your browser settings.',
          variant: 'destructive'
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast({ 
          title: 'Camera Not Found', 
          description: 'No camera device was detected on your device.',
          variant: 'destructive'
        });
      } else {
        toast({ 
          title: 'Camera Error', 
          description: 'Could not access camera. Please check permissions.', 
          variant: 'destructive' 
        });
      }
      
      setIsCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      toast({ title: 'Error', description: 'Camera not initialized.', variant: 'destructive' });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      toast({ title: 'Error', description: 'Could not initialize canvas.', variant: 'destructive' });
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Convert blob to File object
        const selfieFile = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setCapturedSelfie(selfieFile);
        const imageUrl = URL.createObjectURL(blob);
        setCapturedSelfiePreview(imageUrl);
        
        // Stop camera stream
        stopCameraStream();
      } else {
        toast({ title: 'Error', description: 'Failed to capture image.', variant: 'destructive' });
      }
    }, 'image/jpeg', 0.8);
  };

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
          const response = await axios.post(ENDPOINTS.VERIFY_FACE, formData, {
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
          setVerificationResult({success: response.data.success, message: response.data.message});
          if(response.data.success) {
             toast({ title: 'Verification Successful!', description: response.data.message });
             setCurrentStep(3); // Move to final step
          } else {
             toast({ title: 'Verification Failed', description: response.data.message, variant: 'destructive' });
          }
      } catch (error: any) {
          console.error('Error during face verification:', error);
          const errorMsg = error.response?.data?.message || 'Failed to verify face.';
          setVerificationResult({success: false, message: errorMsg});
          toast({ title: 'Verification Error', description: errorMsg, variant: 'destructive' });
      } finally {
          setVerifyingFace(false);
      }
  };

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-10 px-4 flex-grow flex flex-col items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center mb-2">Account Verification</CardTitle>
            <CardDescription className="text-center">Step {currentStep} of 3: {currentStep === 1 ? 'Upload ID Document' : currentStep === 2 ? 'Capture Selfie' : 'Verification Result'}</CardDescription>
            <Progress value={progressValue} className="mt-4 h-2" />
          </CardHeader>

          <CardContent className="mt-6 min-h-[300px]">
            {/* Step 1: Upload ID */}            
            {currentStep === 1 && (
              <div className="space-y-6 flex flex-col items-center">
                <FileCheck className="h-16 w-16 text-primary mb-4" />
                <p className="text-center text-muted-foreground">Please upload a clear image or PDF of your government-issued ID (e.g., Driver's License, Passport).</p>
                <div className="w-full space-y-2">
                  <Label htmlFor="idDocument-flow">Select ID Document</Label>
                  <Input
                    id="idDocument-flow"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleIdFileChange}
                    disabled={uploadingId}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted: JPG, PNG, PDF. Max 5MB.
                  </p>
                </div>
                <Button
                  onClick={handleIdUpload}
                  disabled={!idFile || uploadingId}
                  className="w-full"
                >
                  {uploadingId ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Upload & Proceed'}
                </Button>
              </div>
            )}

            {/* Step 2: Capture Selfie */}            
            {currentStep === 2 && (
              <div className="space-y-4 flex flex-col items-center">
                 <UserCheck className="h-16 w-16 text-primary mb-4" />
                 <p className="text-center text-muted-foreground">Position your face clearly in the frame for verification against your ID.</p>
                
                 {!isCameraActive && !capturedSelfiePreview && (
                    <Button onClick={startCamera} className="w-full">
                       <Camera className="mr-2 h-4 w-4" /> Start Camera
                    </Button>
                 )}
                 
                 {isCameraActive && (
                    <div className="space-y-4 flex flex-col items-center w-full">
                       <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-xs rounded-md border bg-black aspect-[4/3]"></video>
                       <Button onClick={captureSelfie} variant="outline" size="lg" className="rounded-full w-16 h-16 flex items-center justify-center">
                          <Camera className="h-6 w-6" />
                       </Button>
                       <Button variant="link" size="sm" onClick={() => setIsCameraActive(false)}>Cancel</Button>
                       
                       {/* Add Camera Permission Help Dialog */}
                       <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <HelpCircle className="h-4 w-4" />
                              Camera not working?
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Camera Permission Help</DialogTitle>
                              <DialogDescription>
                                Follow these steps to enable camera access:
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-3">
                              <div className="space-y-2">
                                <h3 className="font-medium">Chrome (Android):</h3>
                                <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                                  <li>Tap the lock icon (or site settings) in the address bar</li>
                                  <li>Tap "Site settings"</li>
                                  <li>Find "Camera" and select "Allow"</li>
                                  <li>Refresh the page and try again</li>
                                </ol>
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="font-medium">Chrome (Desktop):</h3>
                                <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                                  <li>Click the lock icon in the address bar</li>
                                  <li>Make sure Camera permissions are set to "Allow"</li>
                                  <li>Refresh the page and try again</li>
                                </ol>
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="font-medium">Chrome Settings:</h3>
                                <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                                  <li>Open Chrome Settings</li>
                                  <li>Go to "Privacy and Security"</li>
                                  <li>Select "Site Settings"</li>
                                  <li>Find "Camera" permissions</li>
                                  <li>Make sure this site is not blocked</li>
                                </ol>
                              </div>
                              
                              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-2">
                                <div className="flex gap-2">
                                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                  <p className="text-sm text-amber-800">
                                    If you're using Chrome in Incognito mode or have third-party cookies blocked, 
                                    you may need to temporarily allow these for camera permissions to work correctly.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                    </div>
                 )}

                 <canvas ref={canvasRef} className="hidden"></canvas>

                 {capturedSelfiePreview && (
                     <div className="space-y-4 flex flex-col items-center w-full">
                        <p className="text-sm text-muted-foreground text-center">Selfie Captured:</p>
                        <img src={capturedSelfiePreview} alt="Selfie Preview" className="rounded-md border max-w-xs" />
                        <div className="flex w-full max-w-xs gap-2">
                            <Button onClick={startCamera} variant="outline" className="flex-1" disabled={verifyingFace}> 
                                Retake
                            </Button>
                            <Button onClick={handleFaceVerificationSubmit} className="flex-1" disabled={verifyingFace}>
                                {verifyingFace ? 
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 
                                    'Verify My Face'}
                            </Button>
                         </div>
                    </div>
                 )}
                 {/* Display verification result message directly in this step if it fails */} 
                 {verificationResult && !verificationResult.success && (
                      <div className={`flex items-center p-3 rounded-md w-full mt-4 bg-red-100 dark:bg-red-900/30`}>
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                        <p className={`text-sm text-red-800 dark:text-red-300'}`}>
                            {verificationResult.message} Please retake your selfie.
                        </p>
                     </div>
                 )}
              </div>
            )}

            {/* Step 3: Result */}            
            {currentStep === 3 && (
               <div className="space-y-6 flex flex-col items-center text-center">
                {verificationResult?.success ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-xl font-semibold">Verification Successful!</h2>
                    <p className="text-muted-foreground">Your account is now verified. You can now access all features.</p>
                    <Button onClick={() => navigate('/profile')} className="w-full max-w-xs">Go to My Profile</Button>
                  </>
                ) : (
                   <>
                    <XCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold">Verification Failed</h2>
                    <p className="text-muted-foreground">{verificationResult?.message || "An unexpected error occurred."}</p>
                    <Button onClick={() => setCurrentStep(2)} variant="outline" className="w-full max-w-xs">Try Selfie Again</Button>
                    <Button onClick={() => setCurrentStep(1)} variant="link" size="sm">Upload Different ID</Button>
                  </>
                )} 
               </div> 
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationFlow; 