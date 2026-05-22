import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import { api, ApiError } from "@/lib/api";
import type { Teacher } from "@/lib/types";

export default function Settings() {
  const { teacher, setTeacher } = useAuth();
  const { regions } = useCatalog();

  const [name, setName] = useState(teacher?.name ?? "");
  const [region, setRegion] = useState(teacher?.region ?? "");
  const [country, setCountry] = useState(teacher?.country ?? "");
  const [schoolName, setSchoolName] = useState(teacher?.schoolName ?? "");
  const [subjects, setSubjects] = useState<string[]>(teacher?.subjects ?? []);
  const [yearGroups, setYearGroups] = useState<string[]>(teacher?.yearGroups ?? []);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name);
      setRegion(teacher.region);
      setCountry(teacher.country ?? "");
      setSchoolName(teacher.schoolName ?? "");
      setSubjects(teacher.subjects);
      setYearGroups(teacher.yearGroups);
    }
  }, [teacher]);

  const r = regions.find((x) => x.id === region);

  const toggle = (list: string[], val: string, set: (v: string[]) => void) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null); setStatus(null);
    try {
      const res = await api.patch<{ teacher: Teacher }>("/auth/me", {
        name, region, country: country || null, schoolName: schoolName || null, subjects, yearGroups,
      });
      setTeacher(res.teacher);
      setStatus("Saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-primary mb-2">Settings</h1>
        <p className="text-muted-foreground">Update your teaching context. This shapes every prompt.</p>
      </header>
      <form onSubmit={save} className="space-y-6 bg-card border rounded-lg p-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{regions.map((rg) => <SelectItem key={rg.id} value={rg.id}>{rg.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="country">Country</Label><Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="school">School</Label><Input id="school" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} /></div>
        </div>
        {r && (
          <>
            <div className="space-y-2">
              <Label>Subjects</Label>
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-3 bg-secondary/50 rounded-md border">
                {r.subjects.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={subjects.includes(s)} onCheckedChange={() => toggle(subjects, s, setSubjects)} />{s}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Year groups</Label>
              <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-3 bg-secondary/50 rounded-md border">
                {r.yearGroups.map((y) => (
                  <label key={y.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={yearGroups.includes(y.value)} onCheckedChange={() => toggle(yearGroups, y.value, setYearGroups)} />{y.label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {status && <div className="text-sm text-primary">{status}</div>}
        <Button type="submit" disabled={busy}>Save changes</Button>
      </form>
    </AppShell>
  );
}
