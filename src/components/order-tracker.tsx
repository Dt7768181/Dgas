
import { cn } from "@/lib/utils";
import { Home, PackageCheck, Truck, Cog, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { useMemo } from "react";

const stepConfig = [
    { name: "Pending", icon: Hourglass, status: "Pending Approval" },
    { name: "Approved", icon: CheckCircle, status: "Approved" },
    { name: "Processing", icon: Cog, status: "Processing" },
    { name: "Out for Delivery", icon: Truck, status: "Out for Delivery" },
    { name: "Delivered", icon: Home, status: "Delivered" },
];

const rejectedStep = { name: "Rejected", icon: XCircle, status: "Rejected" };

export function OrderTracker({ currentStatus }: { currentStatus: string }) {
    const steps = useMemo(() => {
        if (currentStatus === "Rejected") {
            return [{ ...rejectedStep, visualStatus: 'active' }];
        }

        const currentStepIndex = stepConfig.findIndex(s => s.status === currentStatus);
        
        return stepConfig.map((step, index) => {
            let status = 'pending';
            if (currentStepIndex === -1 && index === 0) { // Default to first step if status unknown
                 status = 'active';
            }
            if (index < currentStepIndex) {
                status = 'completed';
            } else if (index === currentStepIndex) {
                status = 'active';
            }
            return { ...step, visualStatus: status };
        });

    }, [currentStatus]);

     if (currentStatus === "Rejected") {
        return (
             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-destructive rounded-lg bg-destructive/10">
                <XCircle className="h-16 w-16 text-destructive mb-4"/>
                <h3 className="text-2xl font-bold text-destructive">Order Rejected</h3>
                <p className="text-muted-foreground">Your booking request was rejected by the administrator. A barrel has been returned to your account.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <ol className={cn(
                "relative text-center",
                `grid grid-cols-${steps.length}`
                )}>
                {steps.map((step, index) => {
                    const isCompleted = step.visualStatus === 'completed';
                    const isActive = step.visualStatus === 'active';
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
