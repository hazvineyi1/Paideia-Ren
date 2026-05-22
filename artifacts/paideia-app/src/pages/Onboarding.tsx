import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import { InlineSpinner } from "@/components/Loading";
import type { Teacher } from "@/lib/types";

export default function Onboarding() {
  const { teacher, setTeacher } = useAuth();
  const { regions } = useCatalog();
  const [, setLoc] = useLocation();
  const region = useMemo(() => regions.find((r) => r.id === teacher?.region), [regions, teacher]);
  const [country, setCountry] = useState(teacher?.country ?? "");
  const [schoolName, setSchoolName] = useState(teacher?.schoolName ?? "");
  const [subjects, setSubjects] = useState<string[]>(teacher?.subjects ?? []);
  const [yearGroups, setYearGroups] = useState<string[]>(teacher?.yearGroups ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], val: string, set: (v: string[]) => void) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!country.trim() || !schoolName.trim() || subjects.length === 0 || yearGroups.length === 0) {
      setError("Please complete every field so we can tailor your samples.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ teacher: Teacher }>("/auth/complete-onboarding", {
        country: country.trim(),
        schoolName: schoolName.trim(),
        subjects,
        yearGroups,
      });
      setTeacher(res.teacher);
      setLoc("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Tell us about your classroom" subtitle="So your lessons, worksheets and quizzes feel right from the first try.">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={region?.label} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Input id="school" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
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
        <Button type="submit" className="w-full" disabled={busy} data-track="onboarding_submit">
          {busy ? <InlineSpinner /> : "Save and continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
