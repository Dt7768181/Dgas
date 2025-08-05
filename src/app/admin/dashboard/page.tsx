
"use client";

import { DeliveryManager } from "@/components/admin/delivery-manager";
import { StockManager } from "@/components/admin/stock-manager";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
    const { user, isLoggedIn, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait until auth state is determined
        if (user === null && isLoggedIn === false) {
             // If not logged in at all, redirect to admin login
            router.push('/admin/login');
            return;
        }

        // Once we have auth state, check for admin role
        if (isLoggedIn) {
            if (!isAdmin) {
                // If logged in but not an admin, deny access
                router.push('/booking'); 
            } else {
                // Is admin, show the page
                setLoading(false);
            }
        }
    }, [isLoggedIn, user, isAdmin, router]);

    if (loading) {
        return <div className="container mx-auto p-8"><p>Loading and verifying access...</p></div>;
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="space-y-4 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Admin Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    Manage your inventory and track all customer deliveries.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8">
                <StockManager />
                <DeliveryManager />
            </div>
        </div>
    );
}
