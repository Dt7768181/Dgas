
"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { Header } from "@/components/header";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
            </div>
        </AuthProvider>
    )
}
