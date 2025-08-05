
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GasCylinderIcon } from "@/components/icons/gas-cylinder-icon";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useState } from "react";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, true); // Set isAdminLogin to true
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <GasCylinderIcon className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 font-headline text-3xl">Admin Portal</CardTitle>
          <CardDescription>Enter your admin credentials to access the dashboard.</CardDescription>
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
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                    </Link>
                </div>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Login to Admin
            </Button>
          </form>
            <div className="mt-4 text-center text-sm">
                Not an admin?{" "}
                <Link href="/login" className="underline">
                User Login
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
