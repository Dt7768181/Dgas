
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Minus, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

export function InventoryManager() {
    const [stock, setStock] = useState({ single: 0, family: 0, commercial: 0 });
    const { toast } = useToast();

    useEffect(() => {
        const stockDocRef = doc(db, "inventory", "stock");
        const unsubscribe = onSnapshot(stockDocRef, (doc) => {
            if (doc.exists()) {
                setStock(doc.data());
            } else {
                console.log("No stock document found!");
            }
        });
        return () => unsubscribe();
    }, []);

    const handleStockChange = async (type, amount) => {
        const stockDocRef = doc(db, "inventory", "stock");
        try {
            // Check if stock will go below zero
            const currentDoc = await getDoc(stockDocRef);
            if (currentDoc.exists()) {
                const currentStock = currentDoc.data()[type];
                if (currentStock + amount < 0) {
                    toast({ title: "Error", description: "Stock cannot go below zero.", variant: "destructive" });
                    return;
                }
            }
            
            await updateDoc(stockDocRef, {
                [type]: increment(amount)
            });
             toast({ title: "Success", description: `Stock for ${type} updated.` });
        } catch (error) {
            console.error("Error updating stock:", error);
            toast({ title: "Error", description: "Failed to update stock.", variant: "destructive" });
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Track and update gas cylinder stock levels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium">Single (5kg)</h4>
                        <p className="text-sm text-muted-foreground">For bachelors and small needs.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" onClick={() => handleStockChange('single', -1)}><Minus /></Button>
                         <span className="text-lg font-bold w-12 text-center">{stock.single}</span>
                         <Button variant="outline" size="icon" onClick={() => handleStockChange('single', 1)}><Plus /></Button>
                    </div>
                </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium">Family (14.2kg)</h4>
                        <p className="text-sm text-muted-foreground">Standard household cylinder.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" onClick={() => handleStockChange('family', -1)}><Minus /></Button>
                         <span className="text-lg font-bold w-12 text-center">{stock.family}</span>
                         <Button variant="outline" size="icon" onClick={() => handleStockChange('family', 1)}><Plus /></Button>
                    </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium">Commercial (19kg)</h4>
                        <p className="text-sm text-muted-foreground">For restaurants and businesses.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" onClick={() => handleStockChange('commercial', -1)}><Minus /></Button>
                         <span className="text-lg font-bold w-12 text-center">{stock.commercial}</span>
                         <Button variant="outline" size="icon" onClick={() => handleStockChange('commercial', 1)}><Plus /></Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
