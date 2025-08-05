
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, collectionGroup, getDocs, query, orderBy, doc, updateDoc, onSnapshot, where } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";

interface Order {
    id: string; // Firestore document ID
    orderId: string;
    cylinderType: string;
    total: number;
    status: string;
    createdAt: { toDate: () => Date };
    deliveryDate: { toDate: () => Date };
    customerName: string;
    userId: string;
}

const statusOptions = ["Confirmed", "Processing", "Out for Delivery", "Delivered", "Cancelled"];

export function DeliveryManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(ordersQuery, async (querySnapshot) => {
            const fetchedOrders: Order[] = [];
            const userPromises = new Map<string, Promise<any>>();
            
            for (const orderDoc of querySnapshot.docs) {
                const orderData = orderDoc.data();
                const userId = orderDoc.ref.parent.parent!.id;

                if (!userPromises.has(userId)) {
                    userPromises.set(userId, getDocs(query(collection(db, 'users'), where('uid', '==', userId))));
                }

                 fetchedOrders.push({
                    id: orderDoc.id,
                    userId: userId,
                    customerName: 'Loading...', // Placeholder
                    ...orderData
                } as Order);
            }

            // Fetch user data in parallel
            for (const [userId, promise] of userPromises.entries()) {
                const userSnapshot = await promise;
                const userName = !userSnapshot.empty ? userSnapshot.docs[0].data().fullName : 'Unknown User';
                 fetchedOrders.forEach(order => {
                    if (order.userId === userId) {
                        order.customerName = userName;
                    }
                });
            }
            
            setOrders(fetchedOrders);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (order: Order, newStatus: string) => {
        const orderDocRef = doc(db, 'users', order.userId, 'orders', order.id);
        try {
            await updateDoc(orderDocRef, { status: newStatus });
            toast({
                title: "Status Updated",
                description: `Order #${order.orderId} is now ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update order status.",
                variant: "destructive"
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
                <CardTitle>Recent Deliveries</CardTitle>
                <CardDescription>A list of all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderId}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                                <TableCell>{formatCylinderType(order.cylinderType)}</TableCell>
                                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                     <Select onValueChange={(value) => handleStatusChange(order, value)} defaultValue={order.status}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
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

