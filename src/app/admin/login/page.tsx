
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GasCylinderIcon } from "@/components/icons/gas-cylinder-icon";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // The login function from useAuth will automatically check for admin role
    const user = await login(email, password, true);
    if (user?.isAdmin) {
      router.push('/admin/dashboard');
    } else {
        // If a non-admin tries to log in here, you might want to show an error
        // or redirect them to the regular user profile page.
        // For now, the hook handles the redirection for non-admins to /profile.
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <GasCylinderIcon className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 font-headline text-3xl">Admin Access</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Login
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
             <Link href="/login" className="underline">
              Are you a customer? Login here.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
