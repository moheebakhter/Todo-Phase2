"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession,
  Session,
  User,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load session ONCE on first mount
   */
  useEffect(() => {
    const storedSession = getSession();
    setSession(storedSession);
    setIsLoading(false);
  }, []);

  /**
   * Keep session & localStorage ALWAYS in sync
   * This is the missing piece that caused 401 loops
   */
  useEffect(() => {
    if (!session) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", session.token);
      localStorage.setItem("auth_user", JSON.stringify(session.user));
    }
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newSession = await authSignIn(email, password);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      setIsLoading(true);
      try {
        const newSession = await authSignUp(email, password, name);
        setSession(newSession);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(() => {
    authSignOut();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
