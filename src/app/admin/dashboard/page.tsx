
"use client";

import { DeliveryManager } from "@/components/delivery-manager";
import { InventoryManager } from "@/components/inventory-manager";
import { NotificationManager } from "@/components/notification-manager";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function AdminDashboardPage() {
    const { isAdmin, isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not logged in or not an admin
        if (!isLoggedIn || !isAdmin) {
            router.push('/admin/login');
        }
    }, [isLoggedIn, isAdmin, router]);

    if (!isLoggedIn || !isAdmin) {
        return <p>Redirecting...</p>;
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="space-y-4 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Admin Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    Manage your inventory, track deliveries, and send notifications.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <InventoryManager />
                <DeliveryManager />
                <div className="lg:col-span-2">
                    <NotificationManager />
                </div>
            </div>
        </div>
    )
}

