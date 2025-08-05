
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function PaymentPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Payment Successful!",
            description: "Your order has been confirmed.",
        });
        setTimeout(() => {
            router.push('/track');
        }, 1500)
    }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-center">
            <IndianRupee className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 text-center font-headline text-3xl">Complete Your Payment</CardTitle>
          <CardDescription className="text-center">Enter your card details to finalize the booking for Order #DGAS12345.</CardDescription>
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
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                    Pay Now (₹850.00)
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
