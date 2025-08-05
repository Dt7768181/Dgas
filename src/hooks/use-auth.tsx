
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
import { auth, db } from "@/lib/firebase";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (email:string, password:string, isAdminLogin?: boolean) => Promise<{ user: User, isAdmin: boolean} | null>;
    signup: (email:string, password:string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email:string, password:string, isAdminLogin = false) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;
            
            const userDocRef = doc(db, "users", loggedInUser.uid);
            const userDoc = await getDoc(userDocRef);
            const userIsAdmin = userDoc.exists() && userDoc.data().role === 'admin';

            toast({
                title: "Login Successful!",
                description: "Welcome back.",
            });

            if (isAdminLogin) {
                 if (userIsAdmin) {
                    router.push('/admin/dashboard');
                 } else {
                    // Not an admin, but tried admin login. Log them out.
                    await signOut(auth);
                    toast({
                        title: "Access Denied",
                        description: "You are not authorized to access the admin panel.",
                        variant: "destructive",
                    });
                    return null;
                 }
            } else {
                router.push('/profile');
            }
            return { user: loggedInUser, isAdmin: userIsAdmin };

        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
            return null;
        }
    };
    
    const signup = async (email:string, password:string, fullName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                fullName: fullName,
                createdAt: new Date(),
                role: 'user', // Default role
            });

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
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                 await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    fullName: user.displayName,
                    createdAt: new Date(),
                    role: 'user', // Default role
                });
            }

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
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAdmin, login, signup, logout, loginWithGoogle }}>
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
