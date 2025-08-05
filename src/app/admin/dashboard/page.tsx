
"use client";

import { DeliveryManager } from "@/components/admin/delivery-manager";
import { StockManager } from "@/components/admin/stock-manager";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboardPage() {
    const { user, isLoggedIn } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        const checkAdminStatus = async () => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    // Redirect non-admin users
                    router.push('/booking');
                }
            }
             setLoading(false);
        };

        checkAdminStatus();

    }, [isLoggedIn, user, router]);

    if (loading) {
        return <div className="container mx-auto p-8"><p>Loading...</p></div>;
    }

    if (!isAdmin) {
        return <div className="container mx-auto p-8"><p>Access Denied.</p></div>;
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
