
import { DeliveryPartnerView } from "@/components/delivery-partner-view";

export default function DeliveryPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="space-y-4 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Delivery Partner Portal</h1>
                <p className="text-lg text-muted-foreground">
                    Here are the orders currently out for delivery.
                </p>
            </div>
            <DeliveryPartnerView />
        </div>
    )
}
