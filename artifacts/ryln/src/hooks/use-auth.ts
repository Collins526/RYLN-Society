import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Member } from "@workspace/api-client-react";

export function useAuth() {
  const [, setLocation] = useLocation();
  
  const [user, setUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem("ryln_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
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

  return { user, login, logout, isAdmin: user?.role === "admin" };
}
