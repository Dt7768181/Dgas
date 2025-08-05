
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { useEffect, useState } from "react";

const cylinderPrices: { [key: string]: number } = {
    single: 450,
    family: 850,
    commercial: 1200,
};

export default function PaymentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [orderTotal, setOrderTotal] = useState(0);
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        const details = sessionStorage.getItem("bookingDetails");
        if (details) {
            const parsedDetails = JSON.parse(details);
            setBookingDetails(parsedDetails);
            const price = cylinderPrices[parsedDetails.cylinderType] || 0;
            const slotPrice = parsedDetails.deliverySlot === 'morning' ? 50 : 0;
            setOrderTotal(price + slotPrice);
            setOrderId(`DGAS${Math.floor(10000 + Math.random() * 90000)}`);
        } else {
            // Handle case where there are no booking details, maybe redirect
            router.push('/');
        }
    }, [router]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !bookingDetails) {
            toast({
                title: "Error",
                description: "User not logged in or booking details are missing.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Save order to Firestore
            const userOrdersCollection = collection(db, "users", user.uid, "orders");
            await addDoc(userOrdersCollection, {
                orderId: orderId,
                ...bookingDetails,
                deliveryDate: new Date(bookingDetails.deliveryDate), // Convert string back to Date
                total: orderTotal,
                status: "Confirmed",
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Payment Successful!",
                description: "Your order has been confirmed.",
            });

            // Clear booking details from session storage
            sessionStorage.removeItem("bookingDetails");

            setTimeout(() => {
                router.push('/track');
            }, 1500)
        } catch (error) {
            console.error("Error saving order:", error);
            toast({
                title: "Order Failed",
                description: "There was an error saving your order.",
                variant: "destructive",
            });
        }
    }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-center">
            <IndianRupee className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 text-center font-headline text-3xl">Complete Your Payment</CardTitle>
          {orderId && <CardDescription className="text-center">Enter your card details to finalize the booking for Order #{orderId}.</CardDescription>}
        </CardHeader>
        <CardContent>
            <form onSubmit={handlePayment} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <div className="relative">
                        <Input id="card-number" type="text" placeholder="•••• •••• •••• ••••" required />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" required />
                    </div>
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={!bookingDetails}>
                    Pay Now (₹{orderTotal.toFixed(2)})
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
