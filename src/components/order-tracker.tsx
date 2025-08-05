import { cn } from "@/lib/utils";
import { Home, PackageCheck, Truck, Cog } from "lucide-react";

const steps = [
    { name: "Order Confirmed", icon: PackageCheck, status: "completed" },
    { name: "Processing", icon: Cog, status: "completed" },
    { name: "Out for Delivery", icon: Truck, status: "active" },
    { name: "Delivered", icon: Home, status: "pending" },
];

export function OrderTracker() {
    return (
        <div className="w-full">
            <ol className="relative grid grid-cols-4 text-center">
                {steps.map((step, index) => {
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';
                    const isLastStep = index === steps.length - 1;

                    return (
                        <li key={step.name} className={cn("relative flex flex-col items-center", !isLastStep && "pr-8 sm:pr-12")}>
                            {!isLastStep && (
                                <div className="absolute left-1/2 top-[1.125rem] -translate-x-1/2 mt-0.5 h-1 w-full" aria-hidden="true">
                                    <div className={cn("h-full w-full", isCompleted ? 'bg-primary' : 'bg-secondary')}></div>
                                </div>
                            )}

                            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background">
                                <span className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-full",
                                    isCompleted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
                                    isActive && 'ring-4 ring-primary/30 bg-primary text-primary-foreground'
                                )}>
                                    <step.icon className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="mt-3">
                                <h3 className={cn("font-medium", isActive ? "text-primary" : "text-foreground")}>{step.name}</h3>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
