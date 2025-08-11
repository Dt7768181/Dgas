
"use client";

import { useState, useEffect, useContext, createContext } from "react";
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (email:string, password:string, isAdminLogin?: boolean) => Promise<any | null>;
    signup: (email:string, password:string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const adminSession = sessionStorage.getItem('adminUser');
        if (adminSession) {
            const adminUser = JSON.parse(adminSession);
            setUser(adminUser as User); 
            setIsAdmin(true);
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const adminSession = sessionStorage.getItem('adminUser');
                if (adminSession) {
                    // If there's an admin session, prioritize it.
                    const adminUser = JSON.parse(adminSession);
                    setUser(adminUser as User);
                    setIsAdmin(true);
                } else {
                    setUser(user);
                    const adminDocRef = doc(db, "admin", user.uid);
                    const adminDoc = await getDoc(adminDocRef);
                    setIsAdmin(adminDoc.exists());
                }
            } else {
                const adminSession = sessionStorage.getItem('adminUser');
                if (!adminSession) {
                    setUser(null);
                    setIsAdmin(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email:string, password:string, isAdminLogin = false) => {
        try {
             if (isAdminLogin) {
                const adminQuery = query(collection(db, "admin"), where("email", "==", email));
                const querySnapshot = await getDocs(adminQuery);

                if (querySnapshot.empty) {
                    toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
                    return null;
                }

                const adminDoc = querySnapshot.docs[0];
                const adminData = adminDoc.data();

                if (adminData.password === password) {
                    const adminUser = {
                        uid: adminDoc.id,
                        email: adminData.email,
                    };
                    sessionStorage.setItem('adminUser', JSON.stringify(adminUser));
                    setUser(adminUser as User);
                    setIsAdmin(true);
                    toast({ title: "Login Successful!", description: "Welcome back, Admin." });
                    router.push('/admin/dashboard');
                    return { user: adminUser, isAdmin: true };
                } else {
                    toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
                    return null;
                }
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;
            
            let userIsAdmin = false;
            
            const adminDocRef = doc(db, "admin", loggedInUser.uid);
            const adminDoc = await getDoc(adminDocRef);
            if(adminDoc.exists()) {
                userIsAdmin = true;
            }

            if (!userIsAdmin) {
                toast({ title: "Login Successful!", description: "Welcome back." });
                router.push('/booking');
            } else {
                await signOut(auth);
                toast({ title: "Access Denied", description: "Please use the appropriate portal to log in.", variant: "destructive" });
                return null;
            }
            
            return { user: loggedInUser, isAdmin: userIsAdmin };

        } catch (error: any) {
            console.error("Login error:", error);
             let errorMessage = "An unknown error occurred.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errorMessage = "Invalid email or password. Please try again.";
            } else {
                errorMessage = error.message;
            }
            toast({
                title: "Login Failed",
                description: errorMessage,
                variant: "destructive",
            });
            return null;
        }
    };
    
    const signup = async (email:string, password:string, fullName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Initialize subscription for regular users
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                fullName: fullName,
                createdAt: new Date(),
                subscription: {
                    barrelsRemaining: 12,
                    expiryDate: Timestamp.fromDate(expiryDate),
                    status: "active",
                }
            });
            toast({
                title: "Signup Successful!",
                description: "Your account and annual subscription have been created.",
            });
            router.push('/profile');

        } catch (error: any) {
             console.error("Signup error:", error);
             let errorMessage = error.message;
             if (error.code === 'auth/email-already-in-use') {
                 errorMessage = "This email is already registered. Please login or use a different email.";
             }
            toast({
                title: "Signup Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const logout = async () => {
        try {
            const adminSession = sessionStorage.getItem('adminUser');
            if (adminSession) {
                sessionStorage.removeItem('adminUser');
                setUser(null);
                setIsAdmin(false);
                toast({
                    title: "Logged Out",
                    description: "You have been successfully logged out.",
                });
                router.push('/admin/login');
            } else {
                await signOut(auth);
                 toast({
                    title: "Logged Out",
                    description: "You have been successfully logged out.",
                });
                router.push('/login');
            }
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
        <AuthContext.Provider value={{ user, isLoggedIn: !!user || isAdmin, isAdmin, login, signup, logout }}>
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
