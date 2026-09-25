"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type User = { id: string; email: string; roles: string[] };
export type Session = { access_token: string };

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@edgefleet.local",
  password: "EdgeFleet-Local-Change-Me-2026!",
};

export const DEMO_CREDENTIALS_LIST = [
  {
    role: "Lead Administrator",
    badge: "FULL RBAC",
    email: "admin@edgefleet.local",
    password: "EdgeFleet-Local-Change-Me-2026!",
    description: "Corridor leases, obstacle injection, task bidding & dispatch, user roles",
  },
  {
    role: "Warehouse Operator",
    badge: "MONITOR & DISPATCH",
    email: "operator@edgefleet.local",
    password: "operator-demo-2026",
    description: "Floor twin monitoring, manual waypoint hold, route telemetry",
  },
];

type AuthState = {
  configured: boolean;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);
const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const validateSession = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const token = window.sessionStorage.getItem("edgefleet_access_token");
    if (!token) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Session expired or invalid");
      }
      const userData = (await response.json()) as User;
      setSession({ access_token: token });
      setUser(userData);
    } catch {
      // Invalidate expired/unreachable token
      window.sessionStorage.removeItem("edgefleet_access_token");
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void validateSession();
  }, [validateSession]);

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Authenticate with the FastAPI backend (OAuth2 password form). There is no offline/demo fallback.
    try {
      const body = new URLSearchParams({ username: trimmedEmail, password: trimmedPassword });
      const response = await fetch(`${apiBase}/api/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (response.ok) {
        const tokenData = (await response.json()) as { access_token: string };
        const token = tokenData.access_token;

        const profileResponse = await fetch(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileResponse.ok) {
          const userData = (await profileResponse.json()) as User;
          window.sessionStorage.setItem("edgefleet_access_token", token);
          setSession({ access_token: token });
          setUser(userData);
          return;
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Invalid email or password on EdgeFleet backend");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "Failed to fetch") {
        throw err;
      }
      throw new Error("Unable to connect to EdgeFleet backend API at " + apiBase + ". Ensure python uvicorn server is running.");
    }
  };

  const signOut = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("edgefleet_access_token");
    }
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        configured: true,
        session,
        user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

