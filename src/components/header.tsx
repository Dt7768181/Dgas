
"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GasCylinderIcon } from "@/components/icons/gas-cylinder-icon";
import { Bell, Home, LogOut, PackageSearch, User, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const initialNotifications = [
    { title: "Delivery Update", description: "Your order #12345 is out for delivery.", time: "5m ago" },
    { title: "Booking Confirmed", description: "Your booking for a family cylinder is confirmed.", time: "1h ago" },
];

const initialPromotions = [
    { title: "New Promotion", description: "Get 10% off on your next booking!", time: "1d ago" },
];

export function Header() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [promotions, setPromotions] = useState(initialPromotions);
    const { isLoggedIn, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const allItems = [...notifications, ...promotions];

    const clearAll = () => {
        setNotifications([]);
        setPromotions([]);
    }

    const handleLogout = () => {
        logout();
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        router.push('/');
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <GasCylinderIcon className="h-8 w-8 text-primary" />
                    <span className="font-headline text-2xl font-bold text-foreground">Dgas</span>
                </Link>
                <nav className="hidden items-center gap-4 md:flex">
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/track">
                            <PackageSearch className="mr-2 h-4 w-4" />
                            Track Order
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                    </Button>
                </nav>
                <div className="flex items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {allItems.length > 0 && (
                                   <span className="absolute top-0 right-0 flex h-2 w-2">
                                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                       <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                   </span>
                                )}
                                <span className="sr-only">Open notifications</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-96">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-medium leading-none">Notifications</h4>
                                    <p className="text-sm text-muted-foreground">You have {allItems.length} new messages.</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={clearAll} disabled={allItems.length === 0}>
                                    <X className="mr-1 h-4 w-4" />
                                    Clear all
                                </Button>
                            </div>
                            <Separator className="my-4" />
                            <Tabs defaultValue="all" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="promotions">Promotions</TabsTrigger>
                                </TabsList>
                                <TabsContent value="all" className="max-h-80 overflow-y-auto">
                                    {allItems.length > 0 ? allItems.map((item, index) => (
                                        <div key={index} className="grid grid-cols-[25px_1fr] items-start gap-3 py-3">
                                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    )) : <p className="py-4 text-center text-sm text-muted-foreground">No new notifications.</p>}
                                </TabsContent>
                                <TabsContent value="promotions" className="max-h-80 overflow-y-auto">
                                    {promotions.length > 0 ? promotions.map((item, index) => (
                                        <div key={index} className="grid grid-cols-[25px_1fr] items-start gap-3 py-3">
                                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-accent" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    )) : <p className="py-4 text-center text-sm text-muted-foreground">No new promotions.</p>}
                                </TabsContent>
                            </Tabs>
                        </PopoverContent>
                    </Popover>
                    {isLoggedIn ? (
                        <Button onClick={handleLogout} variant="outline">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    ) : (
                        <Button asChild>
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
