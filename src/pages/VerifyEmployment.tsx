import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileCheck, CheckCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ENDPOINTS } from '../config/api'; // Import API endpoints

const employmentOptions = [
  { value: 'Employed', label: 'Full-time Employee', description: 'Working for a company or organization' },
  { value: 'Self-Employed', label: 'Self-Employed', description: 'Independent contractor or freelancer' },
  { value: 'Business Owner', label: 'Business Owner', description: 'Own a registered business' },
  { value: 'Retired', label: 'Retired', description: 'No longer working with pension or retirement income' },
  { value: 'Student', label: 'Student', description: 'Full-time or part-time student' },
  { value: 'Other', label: 'Other', description: 'Other employment situation' }
];

const VerifyEmployment = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [employmentStatus, setEmploymentStatus] = useState<string>('');
  const [employmentProofFile, setEmploymentProofFile] = useState<File | null>(null);
  const [income, setIncome] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEmploymentStatusChange = (value: string) => {
    setEmploymentStatus(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEmploymentProofFile(e.target.files[0]);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !employmentStatus) {
      toast({
        title: 'Required Field',
        description: 'Please select your employment status',
        variant: 'destructive'
      });
      return;
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!employmentProofFile) {
      toast({
        title: 'Required Document',
        description: 'Please upload proof of employment',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('idDocument', employmentProofFile);
      formData.append('employmentStatus', employmentStatus);
      formData.append('income', income);

      // In a real implementation, this would go to a specific API endpoint
      await axios.post(
        ENDPOINTS.VERIFY_EMPLOYMENT,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(true);
      toast({
        title: 'Verification Submitted',
        description: 'Your employment verification has been submitted for review.',
      });

      // In reality, this would likely not be an immediate verification
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (error) {
      console.error('Error uploading employment proof:', error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload employment verification. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-10 px-4 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Employment Verification</h1>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {step === 1 ? 'Step 1: Employment Status' : 
                 step === 2 ? 'Step 2: Upload Documentation' : 
                 'Verification Complete'}
              </CardTitle>
              <CardDescription>
                {step === 1 ? 'Select your current employment situation' :
                 step === 2 ? 'Upload proof of your employment and income' :
                 'Your verification has been submitted successfully'}
              </CardDescription>
              <Progress value={progressValue} className="h-2 mt-4" />
            </CardHeader>

            <CardContent className="pt-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <Label className="text-base">Select your employment status:</Label>
                  </div>
                  <RadioGroup 
                    value={employmentStatus} 
                    onValueChange={handleEmploymentStatusChange}
                    className="space-y-3"
                  >
                    {employmentOptions.map((option) => (
                      <div key={option.value} className="flex items-start space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="text-base font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="monthly-income" className="text-base">What is your monthly income? (₱)</Label>
                    <Input 
                      id="monthly-income" 
                      type="number" 
                      placeholder="e.g., 50000" 
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      This helps us match you with properties in your affordability range.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employment-proof" className="text-base">Upload Proof of Employment</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Please upload one of the following:
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 mb-4">
                        {employmentStatus === 'Employed' && (
                          <>
                            <li>Recent pay slip (last 3 months)</li>
                            <li>Employment contract</li>
                            <li>Certificate of employment</li>
                          </>
                        )}
                        {employmentStatus === 'Self-Employed' && (
                          <>
                            <li>Business registration</li>
                            <li>Recent tax filing</li>
                            <li>Client contracts</li>
                          </>
                        )}
                        {employmentStatus === 'Business Owner' && (
                          <>
                            <li>Business permit/license</li>
                            <li>SEC/DTI registration</li>
                            <li>Financial statements</li>
                          </>
                        )}
                        {employmentStatus === 'Retired' && (
                          <>
                            <li>Pension statement</li>
                            <li>Retirement benefit document</li>
                          </>
                        )}
                        {employmentStatus === 'Student' && (
                          <>
                            <li>School enrollment certificate</li>
                            <li>Proof of scholarship/allowance</li>
                          </>
                        )}
                        {employmentStatus === 'Other' && (
                          <>
                            <li>Documentation of income source</li>
                            <li>Bank statements</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileCheck className="h-12 w-12 mx-auto text-primary mb-4" />
                      <Input
                        id="employment-proof"
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                      />
                      <Label 
                        htmlFor="employment-proof"
                        className="bg-primary text-white px-4 py-2 rounded cursor-pointer hover:bg-primary/90"
                      >
                        Select File
                      </Label>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {employmentProofFile ? `Selected: ${employmentProofFile.name}` : "JPG, PNG, PDF up to 5MB"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Verification Submitted!</h3>
                  <p className="text-gray-600 mb-4">
                    Your employment verification has been submitted for review. We'll update your profile once verified.
                  </p>
                  <div className="animate-pulse">
                    <p className="text-sm text-gray-500">Redirecting to profile...</p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between pt-4 border-t bg-gray-50">
              {step > 1 && step < 3 && (
                <Button variant="outline" onClick={handlePreviousStep} disabled={uploading}>
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={handleNextStep} className="ml-auto">
                  Next
                </Button>
              ) : step === 2 ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!employmentProofFile || uploading}
                  className="ml-auto"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Submit Verification'
                  )}
                </Button>
              ) : (
                <Button onClick={() => navigate('/profile')} className="mx-auto">
                  Return to Profile
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmployment; 