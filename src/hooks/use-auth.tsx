
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
    login: (email:string, password:string, isAdminLogin?: boolean, isDeliveryPartnerLogin?: boolean) => Promise<{ user: User, isDeliveryPartner: boolean, isAdmin: boolean } | null>;
    signup: (email:string, password:string, fullName: string, isDeliveryPartner?: boolean, isAdmin?: boolean, employeeId?: string) => Promise<void>;
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
                // Check for admin role
                const adminDocRef = doc(db, "admin", user.uid);
                const adminDoc = await getDoc(adminDocRef);
                if (adminDoc.exists()) {
                    setIsAdmin(true);
                    setIsDeliveryPartner(false); // An admin is not a delivery partner
                    return;
                }

                // Check for delivery partner role
                const partnerDocRef = doc(db, "deliveryPartners", user.uid);
                const partnerDoc = await getDoc(partnerDocRef);
                if (partnerDoc.exists()) {
                    setIsDeliveryPartner(true);
                    setIsAdmin(false); // A delivery partner is not an admin
                } else {
                    setIsDeliveryPartner(false);
                    setIsAdmin(false);
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
            
            let userIsAdmin = false;
            let userIsDeliveryPartner = false;
            
            const adminDocRef = doc(db, "admin", loggedInUser.uid);
            const adminDoc = await getDoc(adminDocRef);
            if(adminDoc.exists()) {
                userIsAdmin = true;
            }

            const partnerDocRef = doc(db, "deliveryPartners", loggedInUser.uid);
            const partnerDoc = await getDoc(partnerDocRef);
            if (partnerDoc.exists()) {
                userIsDeliveryPartner = true;
            }

            if (isAdminLogin) {
                if (userIsAdmin) {
                     toast({ title: "Login Successful!", description: "Welcome back, Admin." });
                    router.push('/admin/dashboard');
                } else {
                    await signOut(auth);
                    toast({ title: "Access Denied", description: "You are not a registered admin.", variant: "destructive" });
                    return null;
                }
            } else if (isDeliveryPartnerLogin) {
                if (userIsDeliveryPartner) {
                    toast({ title: "Login Successful!", description: "Welcome back, Partner." });
                    router.push('/delivery');
                } else {
                     await signOut(auth);
                    toast({ title: "Access Denied", description: "You are not a registered delivery partner.", variant: "destructive" });
                    return null;
                }
            } else { // Regular user login
                if (!userIsAdmin && !userIsDeliveryPartner) {
                    toast({ title: "Login Successful!", description: "Welcome back." });
                    router.push('/booking');
                } else {
                    await signOut(auth);
                    toast({ title: "Access Denied", description: "Please use the appropriate portal to log in.", variant: "destructive" });
                    return null;
                }
            }
            return { user: loggedInUser, isDeliveryPartner: userIsDeliveryPartner, isAdmin: userIsAdmin };

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
    
    const signup = async (email:string, password:string, fullName: string, isDeliveryPartnerSignup = false, isAdminSignup = false, employeeId = '') => {
        try {
            if (isAdminSignup) {
                 if (!employeeId) {
                    toast({ title: "Signup Failed", description: "Employee ID is required for admin registration.", variant: "destructive" });
                    return;
                }

                // Check if employee ID exists in the 'employees' collection
                const employeeDocRef = doc(db, "employees", employeeId);
                const employeeDoc = await getDoc(employeeDocRef);
                if (!employeeDoc.exists()) {
                    toast({ title: "Signup Failed", description: "Invalid Employee ID.", variant: "destructive" });
                    return;
                }

                // Check if the employee ID is already used by another admin
                const q = query(collection(db, "admin"), where("employeeId", "==", employeeId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    toast({ title: "Signup Failed", description: "This Employee ID is already registered.", variant: "destructive" });
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "admin", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    employeeId: employeeId,
                    createdAt: new Date(),
                });
                toast({
                    title: "Admin Signup Successful!",
                    description: "Your administrator account has been created.",
                });
                router.push('/admin/dashboard');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                if (isDeliveryPartnerSignup) {
                     await setDoc(doc(db, "deliveryPartners", user.uid), {
                        uid: user.uid,
                        email: user.email,
                        fullName: fullName,
                        createdAt: new Date(),
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
                    });
                    toast({
                        title: "Signup Successful!",
                        description: "Your account has been created.",
                    });
                    router.push('/profile');
                }
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

    