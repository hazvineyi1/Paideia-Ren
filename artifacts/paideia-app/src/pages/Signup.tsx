import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import type { Teacher } from "@/lib/types";
import { InlineSpinner } from "@/components/Loading";

export default function Signup() {
  const [, setLoc] = useLocation();
  const { setTeacher } = useAuth();
  const { regions } = useCatalog();
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regionId, setRegionId] = useState<string>("");
  const [country, setCountry] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [yearGroups, setYearGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const region = useMemo(() => regions.find((r) => r.id === regionId), [regions, regionId]);

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setStep(2);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{ teacher: Teacher }>("/auth/signup", {
        email,
        password,
        name,
        region: regionId,
        country: country || undefined,
        schoolName: schoolName || undefined,
        subjects,
        yearGroups,
      });
      setTeacher(res.teacher);
      setLoc("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (list: string[], val: string, set: (v: string[]) => void) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  if (step === 1) {
    return (
      <AuthShell title="Create your account" subtitle="Two minutes, free, no card.">
        <form onSubmit={next} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={regionId} onValueChange={setRegionId}>
              <SelectTrigger><SelectValue placeholder="Select your region" /></SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {region && <p className="text-xs text-muted-foreground">{region.description}</p>}
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={!name || !email || !password || !regionId}>Continue</Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary underline">Sign in</Link>
          </p>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="A little about your class" subtitle="So your first samples and prompts fit your teaching.">
      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country (optional)</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={region?.label} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school">School (optional)</Label>
            <Input id="school" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          </div>
        </div>

        {region && (
          <>
            <div className="space-y-2">
              <Label>Subjects you teach</Label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 bg-secondary/50 rounded-md border">
                {region.subjects.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={subjects.includes(s)} onCheckedChange={() => toggle(subjects, s, setSubjects)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Year groups</Label>
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-3 bg-secondary/50 rounded-md border">
                {region.yearGroups.map((y) => (
                  <label key={y.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={yearGroups.includes(y.value)} onCheckedChange={() => toggle(yearGroups, y.value, setYearGroups)} />
                    <span>{y.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {error && <div className="text-sm text-destructive">{error}</div>}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
          <Button type="submit" className="flex-1" disabled={busy}>
            {busy ? <InlineSpinner /> : "Create account"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
