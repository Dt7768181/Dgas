
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Package } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { useAuth } from "@/hooks/use-auth";
import { doc, getDoc, collection, addDoc, serverTimestamp, runTransaction, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formSchema = z.object({
    cylinderType: z.enum(["single", "family", "commercial"], {
        required_error: "You need to select a cylinder type.",
    }),
    deliveryDate: z.date({
        required_error: "A delivery date is required.",
    }),
    deliverySlot: z.string({
        required_error: "Please select a delivery slot.",
    }),
});

interface Subscription {
    barrelsRemaining: number;
    expiryDate: Timestamp;
    status: string;
}

const deliverySlotTimes: { [key: string]: { hours: number, minutes: number} } = {
    morning: { hours: 10, minutes: 0},
    afternoon: { hours: 14, minutes: 0 },
    evening: { hours: 18, minutes: 0 },
}

export function BookingForm() {
    const { toast } = useToast();
    const router = useRouter();
    const { isLoggedIn, user } = useAuth();
    const [address, setAddress] = useState("");
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        const fetchUserData = async () => {
             if (isLoggedIn && user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.address) {
                        setAddress(userData.address);
                    } else {
                         toast({
                            title: "No Address Found",
                            description: "Please add a delivery address to your profile.",
                            variant: "destructive",
                        });
                         router.push('/profile');
                    }
                    if (userData.subscription) {
                        setSubscription(userData.subscription);
                    }
                }
            }
        }
        fetchUserData();
    }, [isLoggedIn, user, toast, router]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!isLoggedIn || !user) {
            toast({
                title: "Login Required",
                description: "Please log in to book a cylinder.",
                variant: "destructive",
            });
            router.push('/login');
            return;
        }

        if (!address) {
            toast({
                title: "Address Required",
                description: "Please set your delivery address in your profile before booking.",
                variant: "destructive",
            });
            router.push('/profile');
            return;
        }

        if (!subscription || subscription.barrelsRemaining <= 0 || subscription.status !== 'active') {
            toast({
                title: "Subscription Issue",
                description: "You have no barrels left or your subscription is inactive. Please contact support.",
                variant: "destructive",
            });
            return;
        }
        
        const bookingDetails = {
            ...values,
            address: address,
        };
        
        try {
            const userDocRef = doc(db, "users", user.uid);

            // Use a transaction to safely decrement the barrel count
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) {
                    throw "User document does not exist!";
                }

                const currentSubscription = userDoc.data().subscription;
                if (!currentSubscription || currentSubscription.barrelsRemaining <= 0) {
                    throw "No barrels remaining!";
                }

                // Decrement barrels
                transaction.update(userDocRef, {
                    "subscription.barrelsRemaining": currentSubscription.barrelsRemaining - 1
                });
                
                // Add the new order
                const deliveryDate = new Date(bookingDetails.deliveryDate);
                const slotTime = deliverySlotTimes[bookingDetails.deliverySlot];
                if (slotTime) {
                    deliveryDate.setHours(slotTime.hours, slotTime.minutes, 0, 0);
                }

                const newOrderRef = doc(collection(db, "users", user.uid, "orders"));
                transaction.set(newOrderRef, {
                    orderId: `DGAS${Math.floor(10000 + Math.random() * 90000)}`,
                    ...bookingDetails,
                    deliveryDate: deliveryDate,
                    total: 0, // No cost as it's from subscription
                    status: "Confirmed",
                    createdAt: serverTimestamp(),
                });
            });

            toast({
                title: "Booking Successful!",
                description: "Your order has been confirmed using one barrel from your subscription.",
            });

            setTimeout(() => {
                router.push('/track');
            }, 1500);

        } catch (error) {
            console.error("Error creating order:", error);
            toast({
                title: "Booking Failed",
                description: typeof error === 'string' ? error : "There was an error placing your order.",
                variant: "destructive",
            });
        }
    }

    return (
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Book Your Cylinder</CardTitle>
                <CardDescription>Fill in the details below to schedule your delivery.</CardDescription>
            </CardHeader>
            <CardContent>
                {subscription && (
                     <div className="mb-6 flex items-center justify-between rounded-lg border bg-secondary/50 p-4">
                        <div className="flex items-center gap-3">
                            <Package className="h-6 w-6 text-primary" />
                            <span className="font-medium">Barrels Remaining</span>
                        </div>
                        <span className="text-xl font-bold text-primary">{subscription.barrelsRemaining}</span>
                    </div>
                )}
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
                                            <FormItem className="flex items-center justify-between space-x-3 space-y-0">
                                                <div className="flex items-center space-x-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="single" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Single (5kg)</FormLabel>
                                                </div>
                                            </FormItem>
                                            <FormItem className="flex items-center justify-between space-x-3 space-y-0">
                                                 <div className="flex items-center space-x-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="family" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Family (14.2kg)</FormLabel>
                                                </div>
                                            </FormItem>
                                            <FormItem className="flex items-center justify-between space-x-3 space-y-0">
                                                 <div className="flex items-center space-x-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="commercial" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Commercial (19kg)</FormLabel>
                                                </div>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <FormField
                            control={form.control}
                            name="deliveryDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Delivery Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
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
                                                <SelectValue placeholder="Select a slot" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="morning">10 AM - 12 PM</SelectItem>
                                            <SelectItem value="afternoon">2 PM - 4 PM</SelectItem>
                                            <SelectItem value="evening">6 PM - 8 PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit" 
                            className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                            size="lg"
                            disabled={!subscription || subscription.barrelsRemaining <= 0 || subscription.status !== 'active'}
                        >
                            Book Using 1 Barrel
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
