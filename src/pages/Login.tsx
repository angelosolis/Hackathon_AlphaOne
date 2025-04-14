import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom"; // Import Link

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

// Define Zod schema for validation
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password cannot be empty." }), // Basic check
});


const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize toast hook
  const { login } = useAuth(); // Get login function from context
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Adjust URL based on your backend setup
      const response = await axios.post('http://localhost:3001/api/auth/login', values);

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
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100"> {/* Changed bg-gray-50 to bg-gray-100 for consistency */}
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"> {/* Added space-y-6 */}
          <h2 className="text-2xl font-bold text-center">Login to Filicon</h2>
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