
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Order {
    id: string;
    orderId: string;
    cylinderType: string;
    total: number;
    status: string;
    createdAt: Timestamp;
}

export default function ProfilePage() {
    const { user, isLoggedIn } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        const fetchUserData = async () => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFullName(userData.fullName || '');
                    setEmail(userData.email || '');
                    setAddress(userData.address || '');
                }

                const ordersQuery = query(collection(db, "users", user.uid, "orders"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(ordersQuery);
                const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                setOrderHistory(orders);
            }
        };

        fetchUserData();

    }, [isLoggedIn, router, user]);

    const handleSaveChanges = async () => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                await updateDoc(userDocRef, {
                    fullName,
                    email,
                    address,
                });
                toast({
                    title: "Success",
                    description: "Your profile has been updated.",
                });
            } catch (error) {
                console.error("Error updating profile: ", error);
                 toast({
                    title: "Error",
                    description: "Failed to update profile.",
                    variant: "destructive",
                });
            }
        }
    };

    const formatCylinderType = (type: string) => {
        switch(type) {
            case 'single': return 'Single (5kg)';
            case 'family': return 'Family (14.2kg)';
            case 'commercial': return 'Commercial (19kg)';
            default: return 'Unknown';
        }
    }


    if (!isLoggedIn || !user) {
        return <p>Loading...</p>; // Or a loading spinner
    }


    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="space-y-4 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Your Profile</h1>
                <p className="text-lg text-muted-foreground">
                    Manage your account settings and view your order history.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Saved Address</Label>
                                <Input id="address" placeholder="e.g. 123 Main St, Anytown" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <Button onClick={handleSaveChanges} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>A list of your past bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderHistory.length > 0 ? orderHistory.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.orderId}</TableCell>
                                            <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                                            <TableCell>{formatCylinderType(order.cylinderType)}</TableCell>
                                            <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{order.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">You have no past orders.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
