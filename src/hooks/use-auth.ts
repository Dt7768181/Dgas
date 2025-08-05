
"use client";

import { useState, useEffect } from "react";

// Mock authentication check
export const useAuth = () => {
    // We use a state variable that can be updated on the client
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // In a real app, you'd check for a token or session
        // We'll use localStorage to persist login state across page reloads
        const loggedInStatus = localStorage.getItem("isLoggedIn");
        if (loggedInStatus === "true") {
            setIsLoggedIn(true);
        }
    }, []);

    const login = () => {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
    };

    // The login function needs to be exposed as well, but for now we only need logout
    // We also expose a "login" function to be used on the login page
    return { isLoggedIn, login, logout };
};
