import { useContext, useState } from "react";
import { AuthContext } from "./useAuth";
import { authService } from "../services/authService";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const register = async (userData) => {
        try {
            const result = await authService.register(userData);
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            setUser(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            const result = await authService.login({ email, password });
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            setUser(result.user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}