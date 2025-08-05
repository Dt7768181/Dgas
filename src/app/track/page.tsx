import { OrderTracker } from "@/components/order-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-4 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Track Your Order</h1>
        <p className="text-lg text-muted-foreground">
          Follow your gas cylinder delivery in real-time.
        </p>
      </div>

      <Card className="mt-12 w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Order #DGAS12345</CardTitle>
            <CardDescription>Family Cylinder (14.2kg)</CardDescription>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary">Estimated Arrival</p>
            <p className="text-muted-foreground">Today, 3:15 PM</p>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
            <OrderTracker />
        </CardContent>
      </Card>
    </div>
  );
}
