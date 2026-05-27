import { createContext, useContext, useEffect, useState } from "react";
import {
  useStudyGetMe,
  useStudyLogin,
  useStudySignup,
  useStudyLogout,
} from "@workspace/api-client-react";
import type { StudyUser } from "@workspace/api-client-react";

interface AuthContextType {
  user: StudyUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function StudyAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudyUser | null>(null);
  const [loading, setLoading] = useState(true);

  const meQuery = useStudyGetMe();
  const loginMutation = useStudyLogin();
  const signupMutation = useStudySignup();
  const logoutMutation = useStudyLogout();

  useEffect(() => {
    if (meQuery.isLoading) return;
    setUser(meQuery.data ?? null);
    setLoading(false);
  }, [meQuery.data, meQuery.isLoading]);

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ data: { email, password } });
    setUser(result.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await signupMutation.mutateAsync({ data: { email, password, name } });
    setUser(result.user);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useStudyAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useStudyAuth must be used within StudyAuthProvider");
  return ctx;
}
