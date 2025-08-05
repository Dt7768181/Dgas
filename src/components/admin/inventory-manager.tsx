
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Flame } from "lucide-react";

interface Stock {
    single: number;
    family: number;
    commercial: number;
}

export function InventoryManager() {
    const [stock, setStock] = useState<Stock>({ single: 0, family: 0, commercial: 0 });
    const [editStock, setEditStock] = useState<Stock>({ single: 0, family: 0, commercial: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const inventoryRef = doc(db, "inventory", "mainStock");
        const unsubscribe = onSnapshot(inventoryRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as Stock;
                setStock(data);
                setEditStock(data);
            } else {
                // You might want to initialize the document if it doesn't exist
                console.log("No stock document found! Consider creating one.");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        const inventoryRef = doc(db, "inventory", "mainStock");
        try {
            // Ensure values are numbers
            const newStock = {
                single: Number(editStock.single) || 0,
                family: Number(editStock.family) || 0,
                commercial: Number(editStock.commercial) || 0,
            };
            await setDoc(inventoryRef, newStock, { merge: true });
            toast({
                title: "Inventory Updated",
                description: "Stock levels have been saved.",
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update inventory", error);
             toast({
                title: "Update Failed",
                description: "Could not save stock levels.",
                variant: "destructive",
            });
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof Stock) => {
        setEditStock(prev => ({ ...prev, [type]: e.target.value }));
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>View and update gas cylinder stock levels.</CardDescription>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit Stock</Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave}>Save</Button>
                        <Button variant="outline" onClick={() => {
                            setIsEditing(false);
                            setEditStock(stock);
                        }}>Cancel</Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Single (5kg)</CardTitle>
                            <Flame className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Input type="number" value={editStock.single} onChange={(e) => handleInputChange(e, 'single')} />
                            ) : (
                                <div className="text-2xl font-bold">{stock.single}</div>
                            )}
                            <p className="text-xs text-muted-foreground">units in stock</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Family (14.2kg)</CardTitle>
                            <Flame className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {isEditing ? (
                                <Input type="number" value={editStock.family} onChange={(e) => handleInputChange(e, 'family')} />
                            ) : (
                                <div className="text-2xl font-bold">{stock.family}</div>
                            )}
                            <p className="text-xs text-muted-foreground">units in stock</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commercial (19kg)</CardTitle>
                            <Flame className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {isEditing ? (
                                <Input type="number" value={editStock.commercial} onChange={(e) => handleInputChange(e, 'commercial')} />
                            ) : (
                                <div className="text-2xl font-bold">{stock.commercial}</div>
                            )}
                            <p className="text-xs text-muted-foreground">units in stock</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
