
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Timestamp } from "firebase/firestore";

interface Order {
    id: string; 
    orderId: string;
    cylinderType: string;
    deliveryDate: Timestamp;
    status: string;
    address: string; // Assuming address is stored in the order
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

export function DeliveryPartnerView() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        // Query all orders without filtering by status to avoid the index requirement.
        const ordersQuery = query(collectionGroup(db, 'orders'));
        
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => {
                const data = doc.data();
                const userId = doc.ref.parent.parent?.id; 
                return { 
                    id: doc.id,
                    userId: userId,
                    ...data 
                } as Order;
            });
            // Filter the orders on the client-side
            const outForDeliveryOrders = fetchedOrders.filter(order => order.status === 'Out for Delivery');
            setOrders(outForDeliveryOrders);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
                <CardDescription>Live feed of orders assigned for delivery.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Delivery Address</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderId}</TableCell>
                                <TableCell>{formatCylinderType(order.cylinderType)}</TableCell>
                                <TableCell>{order.address || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{order.status}</Badge>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No orders currently out for delivery.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
