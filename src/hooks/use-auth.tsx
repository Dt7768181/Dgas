
"use client";

import { useState, useEffect, useContext, createContext } from "react";
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (email:string, password:string) => Promise<void>;
    signup: (email:string, password:string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email:string, password:string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Login Successful!",
                description: "Welcome back.",
            });
            router.push('/profile');
        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };
    
    const signup = async (email:string, password:string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast({
                title: "Signup Successful!",
                description: "Your account has been created.",
            });
            router.push('/profile');
        } catch (error: any) {
             console.error("Signup error:", error);
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
             toast({
                title: "Google Login Successful!",
                description: "Welcome!",
            });
            router.push('/profile');
        } catch (error: any) {
            console.error("Google login error:", error);
            toast({
                title: "Google Login Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
            router.push('/login');
        } catch (error: any) {
             console.error("Logout error:", error);
            toast({
                title: "Logout Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, loginWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
