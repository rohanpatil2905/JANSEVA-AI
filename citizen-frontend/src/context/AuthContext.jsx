import { useState } from "react";
import { AuthContext } from "./useAuth";

const DEMO_USER = {
  name: "Demo Citizen",
  email: "demo@janseva.ai",
  password: "demo123",
  role: "citizen",
};
const DEMO_OFFICIAL = {
  name: "Demo Official",
  email: "official@janseva.ai",
  password: "official123",
  role: "official",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const register = (userData) => {
    const registeredUsers = (() => {
      try {
        const parsedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        return Array.isArray(parsedUsers) ? parsedUsers : [];
      } catch {
        return [];
      }
    })();
    if (registeredUsers.some((item) => item.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }
    const nextUser = { ...userData, email: userData.email.toLowerCase(), role: "citizen" };
    localStorage.setItem("registeredUsers", JSON.stringify([...registeredUsers, nextUser]));
    localStorage.setItem("registeredUser", JSON.stringify(nextUser));
    return { success: true };
  };

  const login = (email, password) => {
    const savedUsers = (() => {
      try {
        const parsedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        return Array.isArray(parsedUsers) ? parsedUsers : [];
      } catch {
        return [];
      }
    })();
    const legacyUser = localStorage.getItem("registeredUser");
    let legacyUsers = [];
    try {
      if (legacyUser) legacyUsers = [JSON.parse(legacyUser)];
    } catch {
      legacyUsers = [];
    }
    const users = [DEMO_USER, DEMO_OFFICIAL, ...savedUsers, ...legacyUsers];

    const registeredUser = users.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
    );
    if (registeredUser) {
      const safeUser = { name: registeredUser.name, email: registeredUser.email, role: registeredUser.role || "citizen" };
      setUser(safeUser);
      localStorage.setItem("user", JSON.stringify(safeUser));
      return { success: true };
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

export default AuthProvider;