
import { Button } from "@/components/ui/button";
import { GasCylinderIcon } from "@/components/icons/gas-cylinder-icon";
import Link from "next/link";
import { HeroPattern } from "@/components/hero-pattern";

export default function WelcomePage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden">
        <HeroPattern />
        <div className="relative z-10 flex flex-col items-center space-y-8 rounded-xl bg-background/80 p-8 text-center backdrop-blur-sm md:p-12">
            <GasCylinderIcon className="h-20 w-20 text-primary" />
            <div className="space-y-4">
                <h1 className="font-headline text-5xl font-bold tracking-tighter text-foreground sm:text-6xl md:text-7xl">
                    Welcome to Dgas
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                    Your trusted partner for fast and reliable gas cylinder delivery. Get started by booking your cylinder now.
                </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/booking">
                        Proceed to Booking
                    </Link>
                </Button>
                 <Button asChild size="lg" variant="outline">
                    <Link href="/login">
                        Login
                    </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                    <Link href="/signup">
                        Sign Up
                    </Link>
                </Button>
            </div>
             <div className="absolute bottom-4 right-4">
                <Button asChild variant="link" className="text-xs text-muted-foreground">
                    <Link href="/admin/login">
                        Admin Login
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
