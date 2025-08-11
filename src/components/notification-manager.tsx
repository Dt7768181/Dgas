
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send } from "lucide-react";

export function NotificationManager() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const { toast } = useToast();

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            toast({
                title: "Error",
                description: "Please fill out both title and description.",
                variant: "destructive",
            });
            return;
        }

        try {
            await addDoc(collection(db, "notifications"), {
                title,
                description,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Notification Sent!",
                description: "The notification has been sent to all users.",
            });
            setTitle("");
            setDescription("");

        } catch (error) {
            console.error("Error sending notification:", error);
            toast({
                title: "Failed to Send",
                description: "There was an error sending the notification.",
                variant: "destructive",
            });
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>Create and send a notification to all clients.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                            id="title" 
                            placeholder="e.g. System Maintenance"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="e.g. We will be down for maintenance on..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        <Send className="mr-2" />
                        Send Notification
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
