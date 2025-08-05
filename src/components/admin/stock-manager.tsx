
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Minus, Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cylinderTypes = [
    { id: 'single', name: 'Single (5kg)' },
    { id: 'family', name: 'Family (14.2kg)' },
    { id: 'commercial', name: 'Commercial (19kg)' },
];

export function StockManager() {
    const [stock, setStock] = useState<{ [key: string]: number }>({});
    const { toast } = useToast();

    useEffect(() => {
        const stockDocRef = doc(db, "inventory", "stock");
        const unsubscribe = onSnapshot(stockDocRef, (doc) => {
            if (doc.exists()) {
                setStock(doc.data());
            } else {
                // Initialize stock if it doesn't exist
                const initialStock = { single: 100, family: 100, commercial: 50 };
                setDoc(stockDocRef, initialStock);
                setStock(initialStock);
            }
        });

        return () => unsubscribe();
    }, []);

    const updateStock = async (cylinderId: string, increment: number) => {
        const newStockCount = Math.max(0, (stock[cylinderId] || 0) + increment);
        const stockDocRef = doc(db, "inventory", "stock");
        try {
            await setDoc(stockDocRef, { [cylinderId]: newStockCount }, { merge: true });
             toast({
                title: "Stock Updated",
                description: `Stock for ${cylinderId} is now ${newStockCount}.`
            });
        } catch (error) {
            console.error("Error updating stock:", error);
            toast({
                title: "Error",
                description: "Failed to update stock.",
                variant: "destructive"
            });
        }
    };
    
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Cylinder Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {cylinderTypes.map((cylinder) => (
                    <Card key={cylinder.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                             <CardTitle className="text-base font-medium">{cylinder.name}</CardTitle>
                             <Package className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <div className="text-3xl font-bold">{stock[cylinder.id] ?? '...'}</div>
                             <div className="flex items-center gap-2 mt-4">
                                <Button size="icon" variant="outline" onClick={() => updateStock(cylinder.id, -1)}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" onClick={() => updateStock(cylinder.id, 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
}
