import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const register = (userData) => {
        localStorage.setItem(
            "registeredUser",
            JSON.stringify(userData)
        );

        return true;
    };

    const login = (email, password) => {
        const savedUser = localStorage.getItem("registeredUser");

        if (!savedUser) {
            return {
                success: false,
                message: "No registered user found.",
            };
        }

        const registeredUser = JSON.parse(savedUser);

        if (
            registeredUser.email === email &&
            registeredUser.password === password
        ) {
            setUser(registeredUser);

            localStorage.setItem(
                "user",
                JSON.stringify(registeredUser)
            );

            return {
                success: true,
            };
        }

        return {
            success: false,
            message: "Invalid email or password.",
        };
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