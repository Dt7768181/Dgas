
"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
    return (
        <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="relative flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                </div>
            </ThemeProvider>
        </AuthProvider>
    )
}
