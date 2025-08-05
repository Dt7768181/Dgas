
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const formSchema = z.object({
    cylinderType: z.enum(["single", "family", "commercial"], {
        required_error: "You need to select a cylinder type.",
    }),
    address: z.string().min(10, {
        message: "Address must be at least 10 characters.",
    }),
    deliverySlot: z.string({
        required_error: "Please select a delivery slot.",
    }),
});

// Mock authentication check
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // In a real app, you'd check for a token or session
        // For now, we'll simulate being logged out
        setIsLoggedIn(false); 
    }, []);

    return { isLoggedIn };
};

export function BookingForm() {
    const { toast } = useToast();
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            address: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);

        if (!isLoggedIn) {
            toast({
                title: "Login Required",
                description: "Please log in to book a cylinder.",
                variant: "destructive",
            });
            router.push('/login');
            return;
        }

        toast({
            title: "Booking Initiated",
            description: "Proceeding to payment...",
        });
        
        setTimeout(() => {
            router.push('/payment');
        }, 1500)
    }

    return (
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Book Your Cylinder</CardTitle>
                <CardDescription>Fill in the details below to schedule your delivery.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="cylinderType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Cylinder Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="single" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Single (5kg)</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="family" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Family (14.2kg)</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="commercial" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Commercial (19kg)</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Delivery Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 123 Main St, Anytown" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="deliverySlot"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Available Delivery Slots</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a slot and price" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="today-afternoon">Today, 2 PM - 4 PM ($85)</SelectItem>
                                            <SelectItem value="today-evening">Today, 6 PM - 8 PM ($85)</SelectItem>
                                            <SelectItem value="tomorrow-morning">Tomorrow, 10 AM - 12 PM ($80)</SelectItem>
                                            <SelectItem value="tomorrow-afternoon">Tomorrow, 2 PM - 4 PM ($80)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                            Book Now & Pay
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
