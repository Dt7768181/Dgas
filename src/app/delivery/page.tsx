
"use client";

import { DeliveryPartnerView } from "@/components/delivery-partner-view";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function DeliveryPage() {
    const { isDeliveryPartner, isLoggedIn } = useAuth();
    const router = useRouter();

     useEffect(() => {
        if (!isLoggedIn) {
            router.push('/delivery/login');
        } else if (!isDeliveryPartner) {
             router.push('/login');
        }
    }, [isLoggedIn, isDeliveryPartner, router]);

    if (!isLoggedIn || !isDeliveryPartner) {
        return <p>Redirecting...</p>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="space-y-4 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Delivery Partner Portal</h1>
                <p className="text-lg text-muted-foreground">
                    Here are the orders currently out for delivery.
                </p>
            </div>
            <DeliveryPartnerView />
        </div>
    )
}
