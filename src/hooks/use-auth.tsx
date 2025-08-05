
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
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isDeliveryPartner: boolean;
    login: (email:string, password:string, isAdminLogin?: boolean, isDeliveryPartnerLogin?: boolean) => Promise<{ user: User, isAdmin: boolean, isDeliveryPartner: boolean } | null>;
    signup: (email:string, password:string, fullName: string, isDeliveryPartner?: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDeliveryPartner, setIsDeliveryPartner] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setIsAdmin(userData.role === 'admin');
                    setIsDeliveryPartner(userData.role === 'deliveryPartner');
                } else {
                     setIsAdmin(false);
                     setIsDeliveryPartner(false);
                }
            } else {
                setIsAdmin(false);
                setIsDeliveryPartner(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email:string, password:string, isAdminLogin = false, isDeliveryPartnerLogin = false) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;
            
            const userDocRef = doc(db, "users", loggedInUser.uid);
            const userDoc = await getDoc(userDocRef);
            let userIsAdmin = false;
            let userIsDeliveryPartner = false;

            if (userDoc.exists()) {
                const userData = userDoc.data();
                userIsAdmin = userData.role === 'admin';
                userIsDeliveryPartner = userData.role === 'deliveryPartner';
            }
            
            toast({
                title: "Login Successful!",
                description: "Welcome back.",
            });

            if (isAdminLogin) {
                 if (userIsAdmin) {
                    router.push('/admin/dashboard');
                 } else {
                    await signOut(auth);
                    toast({
                        title: "Access Denied",
                        description: "You are not authorized to access the admin panel.",
                        variant: "destructive",
                    });
                    return null;
                 }
            } else if (isDeliveryPartnerLogin) {
                if (userIsDeliveryPartner) {
                    router.push('/delivery');
                } else {
                     await signOut(auth);
                    toast({
                        title: "Access Denied",
                        description: "You are not authorized to access the delivery portal.",
                        variant: "destructive",
                    });
                    return null;
                }
            }
            else {
                router.push('/booking');
            }
            return { user: loggedInUser, isAdmin: userIsAdmin, isDeliveryPartner: userIsDeliveryPartner };

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
    
    const signup = async (email:string, password:string, fullName: string, isDeliveryPartner = false) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const role = isDeliveryPartner ? 'deliveryPartner' : 'user';

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                fullName: fullName,
                createdAt: new Date(),
                role: role,
            });

            toast({
                title: "Signup Successful!",
                description: "Your account has been created.",
            });

            if (isDeliveryPartner) {
                router.push('/delivery');
            } else {
                router.push('/booking');
            }
        } catch (error: any) {
             console.error("Signup error:", error);
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

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
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAdmin, isDeliveryPartner, login, signup, logout }}>
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
