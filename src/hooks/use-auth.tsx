
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
                // Check both collections to determine the user's role
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                 if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                    setIsDeliveryPartner(false);
                    return;
                }

                const partnerDocRef = doc(db, "deliveryPartners", user.uid);
                const partnerDoc = await getDoc(partnerDocRef);
                if (partnerDoc.exists()) {
                    setIsDeliveryPartner(true);
                    setIsAdmin(false);
                } else {
                    setIsDeliveryPartner(false);
                    // Check for admin role in users collection if not a partner
                    if(userDoc.exists()) {
                         setIsAdmin(userDoc.data().role === 'admin');
                    } else {
                        setIsAdmin(false);
                    }
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
             // Role-specific checks before login
            if (isDeliveryPartnerLogin) {
                const q = query(collection(db, "deliveryPartners"), where("email", "==", email));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                     toast({ title: "Login Failed", description: "This email is not registered as a delivery partner.", variant: "destructive" });
                     return null;
                }
            } else { // For regular users and admins
                 const q = query(collection(db, "users"), where("email", "==", email));
                 const querySnapshot = await getDocs(q);
                 if (querySnapshot.empty) {
                     toast({ title: "Login Failed", description: "This email is not registered as a user. Are you a delivery partner?", variant: "destructive" });
                     return null;
                 }
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;
            
            let userIsAdmin = false;
            let userIsDeliveryPartner = false;

            if (isDeliveryPartnerLogin) {
                 const partnerDocRef = doc(db, "deliveryPartners", loggedInUser.uid);
                 const partnerDoc = await getDoc(partnerDocRef);
                 if (partnerDoc.exists()) {
                     userIsDeliveryPartner = true;
                 }
            } else {
                const userDocRef = doc(db, "users", loggedInUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    userIsAdmin = userDoc.data().role === 'admin';
                }
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
                        description: "You are not a registered delivery partner.",
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
    
    const signup = async (email:string, password:string, fullName: string, isDeliveryPartnerSignup = false) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (isDeliveryPartnerSignup) {
                 await setDoc(doc(db, "deliveryPartners", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    fullName: fullName,
                    createdAt: new Date(),
                    role: 'deliveryPartner'
                });
                toast({
                    title: "Partner Signup Successful!",
                    description: "Your delivery partner account has been created.",
                });
                router.push('/delivery');

            } else {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    fullName: fullName,
                    createdAt: new Date(),
                    role: 'user', // or 'admin' based on logic
                });
                toast({
                    title: "Signup Successful!",
                    description: "Your account has been created.",
                });
                router.push('/booking');
            }

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
