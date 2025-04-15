import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom"; // Import Link
import React, { useEffect, useState } from 'react'; // Import useState

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import Navbar from '@/components/Navbar'; // Use alias
import { useAuth } from '@/context/AuthContext'; // Use alias
import { ENDPOINTS } from '../config/api'; // Import the endpoints

// Define Zod schema for validation
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password cannot be empty." }), // Basic check
});


const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize toast hook
  const { login, isAuthenticated, userType, isLoading: authLoading } = useAuth(); // Rename to avoid confusion
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // --- Redirect Effect --- 
  useEffect(() => {
    // Don't redirect until auth state is loaded
    if (authLoading) {
      return; 
    }
    
    // If authenticated and is an Agent, redirect to dashboard
    if (isAuthenticated && userType === 'Agent') {
      console.log("Login Page: User is authenticated Agent, redirecting to /agent-dashboard");
      navigate('/agent-dashboard', { replace: true });
    } 
    // Optional: Redirect authenticated Clients away from login too?
    // else if (isAuthenticated && userType === 'Client') {
    //   console.log("Login Page: User is authenticated Client, redirecting to /profile");
    //   navigate('/profile', { replace: true }); 
    // }
  }, [isAuthenticated, userType, navigate, authLoading]); // Update dependency

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Use the endpoint from the config instead of hardcoded URL
      const response = await axios.post(ENDPOINTS.LOGIN, values);
      
      console.log("Login successful:", response.data);
      // Use the login function from context
      if (response.data.token && response.data.userId && response.data.userType) {
        login(response.data.token, response.data.userId, response.data.userType);
        toast({ title: "Login Successful!", description: "Redirecting..." });
        // Navigation is now handled within the login function in AuthContext
      } else {
         // Handle case where token/userId/userType might be missing in response
        throw new Error('Incomplete login response from server.');
      }

    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" }); // Show error
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading or minimal UI while checking auth state?
  if (authLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            {/* Optional: Add a spinner */}
             <p>Loading...</p>
         </div>
      ); 
      // Or return null; or a skeleton loader
  }

  // Render the login form if not loading and not redirected
  return (
    <div className="min-h-screen flex flex-col bg-gray-100"> {/* Changed bg-gray-50 to bg-gray-100 for consistency */}
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"> {/* Added space-y-6 */}
          <h2 className="text-2xl font-bold text-center">Login to PhilCon</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* Added space-y-4 */}
               <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white"> {/* Use Button component */}
                Login
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-gray-600"> {/* Adjusted text size */}
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-red-500 hover:underline"> {/* Use Link component */}
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;