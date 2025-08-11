
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, onSnapshot, query, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

interface Order {
    id: string; // This will be the path to the document
    orderId: string;
    cylinderType: string;
    deliveryDate: Timestamp;
    status: string;
    total: number;
    userId: string;
}

const formatCylinderType = (type: string) => {
    switch(type) {
        case 'single': return 'Single (5kg)';
        case 'family': return 'Family (14.2kg)';
        case 'commercial': return 'Commercial (19kg)';
        default: return 'Unknown';
    }
};

export function DeliveryManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const ordersQuery = query(collectionGroup(db, 'orders'));
        
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => {
                const data = doc.data();
                const userId = doc.ref.parent.parent?.id; // Get the userId from the path
                return { 
                    id: doc.id,
                    userId: userId,
                    ...data 
                } as Order;
            });
            setOrders(fetchedOrders);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (order: Order, newStatus: string) => {
        if (!order.userId || !order.id) {
            toast({ title: "Error", description: "Order or User ID is missing.", variant: "destructive" });
            return;
        }

        const orderRef = doc(db, "users", order.userId, "orders", order.id);
        try {
            await updateDoc(orderRef, { status: newStatus });
            toast({ title: "Success", description: `Order #${order.orderId} updated to ${newStatus}.` });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
        }
    };


    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Delivery Management</CardTitle>
                <CardDescription>Live feed of all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderId}</TableCell>
                                <TableCell>{formatCylinderType(order.cylinderType)}</TableCell>
                                <TableCell>{order.deliveryDate.toDate().toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={order.total > 0 ? "secondary" : "default"}>
                                        {order.total > 0 ? `Paid (₹${order.total})` : 'Subscription'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Select 
                                        defaultValue={order.status} 
                                        onValueChange={(newStatus) => handleStatusChange(order, newStatus)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                                            <SelectItem value="Processing">Processing</SelectItem>
                                            <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                            <SelectItem value="Delivered">Delivered</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No orders found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
