import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [token, setToken] = useState(() =>
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");

        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const login = (loginResponse) => {
        setToken(loginResponse.token);
        setUser(loginResponse.user);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = Boolean(token && user);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}

export { AuthProvider, useAuth };