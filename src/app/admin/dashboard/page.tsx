
"use client";

import { InventoryManager } from "@/components/admin/inventory-manager";
import { DeliveryManager } from "@/components/admin/delivery-manager";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
    const { isAdmin, isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/admin/login');
        } else if (!isAdmin) {
            router.push('/');
        }
    }, [isAdmin, isLoggedIn, router])

    if (!isLoggedIn || !isAdmin) {
        return <p>Loading or redirecting...</p>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="space-y-4 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Admin Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    Manage inventory, track deliveries, and oversee operations.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8">
                <div>
                    <InventoryManager />
                </div>
                <div>
                    <DeliveryManager />
                </div>
            </div>
        </div>
    );
}
