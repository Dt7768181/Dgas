import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orderHistory = [
    { id: "#DGAS12345", date: "2024-05-20", item: "Family Cylinder", total: "$85.00", status: "Delivered" },
    { id: "#DGAS12301", date: "2024-04-15", item: "Family Cylinder", total: "$82.50", status: "Delivered" },
    { id: "#DGAS11998", date: "2024-03-11", item: "Single Cylinder", total: "$45.00", status: "Delivered" },
];

export default function ProfilePage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="space-y-4 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Your Profile</h1>
                <p className="text-lg text-muted-foreground">
                    Manage your account settings and view your order history.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue="john.doe@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Saved Address</Label>
                                <Input id="address" defaultValue="123 Main St, Anytown" />
                            </div>
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>A list of your past bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderHistory.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>{order.date}</TableCell>
                                            <TableCell>{order.item}</TableCell>
                                            <TableCell>{order.total}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{order.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
