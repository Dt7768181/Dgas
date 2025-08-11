
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
    login: (email:string, password:string, isAdminLogin?: boolean, isDeliveryPartnerLogin?: boolean) => Promise<any | null>;
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
            if (user) {
                setUser(user);
                const adminDocRef = doc(db, "admin", user.uid);
                const adminDoc = await getDoc(adminDocRef);
                setIsAdmin(adminDoc.exists());

                const partnerDocRef = doc(db, "deliveryPartners", user.uid);
                const partnerDoc = await getDoc(partnerDocRef);
                setIsDeliveryPartner(partnerDoc.exists());
            } else {
                 const adminSession = sessionStorage.getItem('adminUser');
                 if (adminSession) {
                     const adminUser = JSON.parse(adminSession);
                     setUser(adminUser as User); // This is not a real Firebase User object
                     setIsAdmin(true);
                     setIsDeliveryPartner(false);
                 } else {
                    setUser(null);
                    setIsAdmin(false);
                    setIsDeliveryPartner(false);
                 }
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email:string, password:string, isAdminLogin = false, isDeliveryPartnerLogin = false) => {
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
                     // IMPORTANT: This is a mock user object and not a real Firebase User.
                    // Session will only persist in sessionStorage.
                    const adminUser = {
                        uid: adminDoc.id,
                        email: adminData.email,
                    };
                    sessionStorage.setItem('adminUser', JSON.stringify(adminUser));
                    setUser(adminUser as User);
                    setIsAdmin(true);
                    setIsDeliveryPartner(false);
                    toast({ title: "Login Successful!", description: "Welcome back, Admin." });
                    router.push('/admin/dashboard');
                    return { user: adminUser, isAdmin: true, isDeliveryPartner: false };
                } else {
                    toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
                    return null;
                }
            }

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

            if (isDeliveryPartnerLogin) {
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

                const employeeDocRef = doc(db, "employees", employeeId);
                const employeeDoc = await getDoc(employeeDocRef);
                if (!employeeDoc.exists()) {
                    toast({ title: "Signup Failed", description: "Invalid Employee ID.", variant: "destructive" });
                    return;
                }

                const q = query(collection(db, "admin"), where("employeeId", "==", employeeId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    toast({ title: "Signup Failed", description: "This Employee ID is already registered.", variant: "destructive" });
                    return;
                }

                 const adminEmailQuery = query(collection(db, "admin"), where("email", "==", email));
                const adminEmailSnapshot = await getDocs(adminEmailQuery);
                if (!adminEmailSnapshot.empty) {
                    toast({ title: "Signup Failed", description: "This email is already registered for an admin account.", variant: "destructive" });
                    return;
                }


                await addDoc(collection(db, "admin"), {
                    email: email,
                    password: password, // Storing password in plaintext - NOT RECOMMENDED
                    employeeId: employeeId,
                    createdAt: new Date(),
                });
                toast({
                    title: "Admin Signup Successful!",
                    description: "Your administrator account has been created. Please log in.",
                });
                router.push('/admin/login');

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
