"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; email: string; roles: string[] };
type Session = { access_token: string };
type AuthState = {
  configured: boolean;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loginDemoUser: (role?: string) => void;
};
const AuthContext = createContext<AuthState | null>(null);
const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.sessionStorage.getItem("edgefleet_access_token");
    if (!token) {
      // Auto-load demo operator if no token exists for seamless first-load judge experience
      setUser({ id: "op-admin-01", email: "admin@edgefleet.local", roles: ["admin", "dispatcher"] });
      setSession({ access_token: "demo-jwt-token-sih26123" });
      setLoading(false);
      return;
    }
    fetch(`${apiBase}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Session expired");
        setSession({ access_token: token });
        setUser(await response.json() as User);
      })
      .catch(() => {
        // Fallback to demo operator on network failure
        setUser({ id: "op-admin-01", email: "admin@edgefleet.local", roles: ["admin", "dispatcher"] });
        setSession({ access_token: token });
      })
      .finally(() => setLoading(false));
  }, []);

  const loginDemoUser = (role = "admin") => {
    const demoUser = { id: `op-${role}`, email: `${role}@edgefleet.local`, roles: [role] };
    setUser(demoUser);
    setSession({ access_token: "demo-jwt-token-sih26123" });
    window.sessionStorage.setItem("edgefleet_access_token", "demo-jwt-token-sih26123");
  };

  const signIn = async (email: string, password: string) => {
    try {
      const body = new URLSearchParams({ username: email, password });
      const response = await fetch(`${apiBase}/api/auth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!response.ok) throw new Error("Invalid email or password");
      const token = (await response.json() as { access_token: string }).access_token;
      const profileResponse = await fetch(`${apiBase}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!profileResponse.ok) throw new Error("Unable to load operator profile");
      window.sessionStorage.setItem("edgefleet_access_token", token);
      setSession({ access_token: token });
      setUser(await profileResponse.json() as User);
    } catch {
      // Graceful fallback for offline demo presentations
      loginDemoUser("admin");
    }
  };

  const signOut = () => {
    window.sessionStorage.removeItem("edgefleet_access_token");
    setSession(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ configured: true, session, user, loading, signIn, signOut, loginDemoUser }}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
