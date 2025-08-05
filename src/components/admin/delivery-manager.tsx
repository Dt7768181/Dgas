
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collectionGroup, query, onSnapshot, doc, getDoc, updateDoc, collection, getDocs, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Order {
    id: string; // Firestore document ID
    orderId: string;
    cylinderType: string;
    total: number;
    status: string;
    deliveryDate: any;
    userId: string;
    userName?: string;
}

const statusOptions = ["Confirmed", "Processing", "Out for Delivery", "Delivered", "Cancelled"];

export function DeliveryManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const ordersQuery = query(collectionGroup(db, 'orders'));
        
        const unsubscribe = onSnapshot(ordersQuery, async (snapshot) => {
            const fetchedOrders: Order[] = [];
            const userPromises = new Map<string, Promise<any>>();

            snapshot.forEach(doc => {
                const data = doc.data();
                const userId = doc.ref.parent.parent!.id; // Assumes orders are in /users/{userId}/orders
                
                if (!userPromises.has(userId)) {
                    // In a real app, user data might be denormalized onto the order.
                     const userDocRef = doc(db, 'users', userId);
                     userPromises.set(userId, getDoc(userDocRef));
                }

                 fetchedOrders.push({
                    id: doc.id,
                    userId,
                    ...data
                } as Order);
            });

            // Wait for all user data to be fetched
            const userDocs = await Promise.all(userPromises.values());
            const users = new Map(userDocs.map(d => [d.id, d.data()]));

            // Map user names to orders
            const ordersWithUsers = fetchedOrders.map(order => ({
                ...order,
                userName: users.get(order.userId)?.fullName || 'Unknown User'
            }));

            // Sort by date client-side to avoid needing a composite index initially
            ordersWithUsers.sort((a, b) => b.deliveryDate.toMillis() - a.deliveryDate.toMillis());

            setOrders(ordersWithUsers);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (order: Order, newStatus: string) => {
        const orderRef = doc(db, 'users', order.userId, 'orders', order.id);
        try {
            await updateDoc(orderRef, { status: newStatus });
            toast({
                title: "Status Updated",
                description: `Order #${order.orderId} is now ${newStatus}.`,
            });
        } catch (error) {
            console.error("Failed to update status", error);
            toast({
                title: "Update Failed",
                description: "Could not update the order status.",
                variant: "destructive",
            });
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

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Delivery Management</CardTitle>
                <CardDescription>Track and update all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderId}</TableCell>
                                <TableCell>{order.userName}</TableCell>
                                <TableCell>{order.deliveryDate.toDate().toLocaleString()}</TableCell>
                                <TableCell>{formatCylinderType(order.cylinderType)}</TableCell>
                                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                   <Select onValueChange={(value) => handleStatusChange(order, value)} defaultValue={order.status}>
                                        <SelectTrigger>
                                            <SelectValue>
                                                <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No orders found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
