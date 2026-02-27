import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  uid: string;
  phone: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (_phone: string, _otp: string) => {
    setLoading(true);
    // Simulate Firebase phone auth
    await new Promise((r) => setTimeout(r, 1500));
    setUser({ uid: "user_001", phone: _phone, displayName: "Ramesh" });
    setLoading(false);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
