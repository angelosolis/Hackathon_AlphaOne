import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios'; // Make sure axios is installed
import { useNavigate, Link } from "react-router-dom"; // For redirect and links

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" // For User Type
import { useToast } from "@/components/ui/use-toast"; // Correct hook import
import Navbar from '@/components/Navbar'; // Use alias
import { useAuth } from '@/context/AuthContext'; // Use alias

// Define Zod schema for validation
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    userType: z.enum(["Client", "Agent"], { required_error: "You need to select a user type." }),
});

export default function Register() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login } = useAuth(); // Get login function from context
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            userType: undefined, // Default to undefined
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', values);
            console.log("Registration successful:", response.data);

            // Use the login function from context after successful registration
            if (response.data.token && response.data.userId && response.data.userType) {
                login(response.data.token, response.data.userId, response.data.userType);
                toast({ title: "Registration Successful!", description: "Redirecting..." });
                // Navigation is now handled within the login function in AuthContext
            } else {
                // Handle case where token/userId/userType might be missing in response
                throw new Error('Incomplete registration response from server.');
            }

        } catch (error: any) {
            console.error("Registration failed:", error);
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
             toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
        }
    }

    return (
        // Add Navbar back here
        <div className="min-h-screen flex flex-col bg-gray-100"> {/* Use consistent background */}
             <Navbar />
            <main className="flex-grow flex items-center justify-center"> {/* Added flex-grow */}
                 <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center">Register with Filicon</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                             <FormField
                                control={form.control}
                                name="userType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Register as:</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="Client" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Client (Looking to Buy/Sell/Rent)
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="Agent" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                             Agent / Broker
                                            </FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white">
                                Register
                            </Button>
                        </form>
                    </Form>
                     <p className="text-sm text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-red-500 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}