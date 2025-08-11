
import { BookingForm } from '@/components/booking-form';
import { HeroPattern } from '@/components/hero-pattern';

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Fast & Reliable Gas Delivery
          </h1>
          <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl lg:mx-0">
            Get your gas cylinders delivered to your doorstep with ease. Use your annual subscription to book a cylinder.
          </p>
          <div className="hidden lg:block">
            <HeroPattern />
          </div>
        </div>
        <div className="flex justify-center">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
