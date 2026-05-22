import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { identify, track } from "@/lib/analytics";
import type { Teacher } from "@/lib/types";

interface AuthCtx {
  teacher: Teacher | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setTeacher: (t: Teacher | null) => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.get<{ teacher: Teacher | null }>("/auth/me");
      setTeacher(res.teacher);
      if (res.teacher) identify();
    } catch {
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const setTeacherTracked = (t: Teacher | null) => {
    setTeacher(t);
    if (t) {
      identify();
      track("session_started");
    }
  };

  const signOut = async () => {
    track("sign_out_clicked");
    await api.post("/auth/logout");
    setTeacher(null);
  };

  return (
    <Ctx.Provider value={{ teacher, loading, refresh, setTeacher: setTeacherTracked, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
