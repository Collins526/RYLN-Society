import { createContext, useContext, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Member } from "@workspace/api-client-react";

interface AuthContextValue {
  user: Member | null;
  login: (token: string, member: Member) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const [user, setUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem("ryln_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (token: string, member: Member) => {
    localStorage.setItem("ryln_token", token);
    localStorage.setItem("ryln_user", JSON.stringify(member));
    setUser(member);
  };

  const logout = () => {
    localStorage.removeItem("ryln_token");
    localStorage.removeItem("ryln_user");
    setUser(null);
    setLocation("/login");
  };

  const value = useMemo(
    () => ({ user, login, logout, isAdmin: user?.role === "admin" }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
