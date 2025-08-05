"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GasCylinderIcon } from "@/components/icons/gas-cylinder-icon";
import { Bell, Home, PackageSearch, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";

const notifications = [
    { title: "Delivery Update", description: "Your order #12345 is out for delivery.", time: "5m ago" },
    { title: "Booking Confirmed", description: "Your booking for a family cylinder is confirmed.", time: "1h ago" },
    { title: "New Promotion", description: "Get 10% off on your next booking!", time: "1d ago" },
];

export function Header() {
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
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5" />
                                <span className="sr-only">Open notifications</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Notifications</h4>
                                <p className="text-sm text-muted-foreground">You have {notifications.length} unread messages.</p>
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-4">
                                {notifications.map((notification, index) => (
                                    <div key={index} className="grid grid-cols-[25px_1fr] items-start gap-3">
                                        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{notification.title}</p>
                                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
