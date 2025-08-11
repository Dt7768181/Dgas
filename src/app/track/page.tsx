
"use client";

import { OrderTracker } from "@/components/order-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
    id: string;
    orderId: string;
    cylinderType: string;
    total: number;
    status: string;
    createdAt: Timestamp;
    deliveryDate: Timestamp;
}

const formatCylinderType = (type: string) => {
    switch(type) {
        case 'single': return 'Single (5kg)';
        case 'family': return 'Family (14.2kg)';
        case 'commercial': return 'Commercial (19kg)';
        default: return 'Unknown';
    }
}

export default function TrackOrderPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const fetchLatestOrder = async () => {
      if (user) {
        try {
          const ordersQuery = query(collection(db, "users", user.uid, "orders"), orderBy("createdAt", "desc"), limit(1));
          const querySnapshot = await getDocs(ordersQuery);
          
          if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            setLatestOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
          }
        } catch(error) {
            console.error("Failed to fetch latest order", error);
        } finally {
            setLoading(false);
        }
      }
    };

    fetchLatestOrder();
  }, [isLoggedIn, user, router]);


  if (loading) {
      return (
          <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
              <p>Loading your order details...</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-4 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Track Your Order</h1>
        <p className="text-lg text-muted-foreground">
          Follow your gas cylinder delivery in real-time.
        </p>
      </div>

      {latestOrder ? (
         <Card className="mt-12 w-full shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-2xl">Order #{latestOrder.orderId}</CardTitle>
                <CardDescription>{formatCylinderType(latestOrder.cylinderType)}</CardDescription>
            </div>
             {latestOrder.status !== 'Rejected' && (
                <div className="text-left sm:text-right">
                    <p className="font-bold text-primary">Estimated Arrival</p>
                    <p className="text-muted-foreground">{latestOrder.deliveryDate.toDate().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
            )}
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
                <OrderTracker currentStatus={latestOrder.status} />
            </CardContent>
        </Card>
      ) : (
        <div className="mt-12 text-center">
            <p className="text-muted-foreground">You have no active orders to track.</p>
        </div>
      )}
     
    </div>
  );
}
