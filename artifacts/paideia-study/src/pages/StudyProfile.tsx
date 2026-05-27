import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  useGetStudyProfile,
  useUpdateStudyProfile,
} from "@workspace/api-client-react";
import { ArrowLeft, User, Save } from "lucide-react";

export default function StudyProfile() {
  const [, setLoc] = useLocation();
  const { data: profile, isLoading } = useGetStudyProfile();
  const updateMutation = useUpdateStudyProfile();

  const [examTarget, setExamTarget] = useState("");
  const [studyStyle, setStudyStyle] = useState("");
  const [interests, setInterests] = useState("");
  const [background, setBackground] = useState("");
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setExamTarget(profile.examTarget || "");
      setStudyStyle(profile.studyStyle || "");
      setInterests(profile.interests?.join(", ") || "");
      setBackground(profile.background || "");
      setDailyStudyMinutes(profile.dailyStudyMinutes ?? 30);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        data: {
          examTarget: examTarget || null,
          studyStyle: studyStyle || undefined,
          interests: interests ? interests.split(",").map((s) => s.trim()).filter(Boolean) : [],
          background: background || null,
          dailyStudyMinutes,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Learner Profile</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="exam">Target Exam / Course</Label>
                <Input
                  id="exam"
                  placeholder="e.g., MCAT, CFA Level I, AP Biology"
                  value={examTarget}
                  onChange={(e) => setExamTarget(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="style">Study Style</Label>
                <Input
                  id="style"
                  placeholder="e.g., visual, auditory, kinesthetic, reading/writing"
                  value={studyStyle}
                  onChange={(e) => setStudyStyle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="interests">Interests (comma-separated)</Label>
                <Input
                  id="interests"
                  placeholder="e.g., neuroscience, finance, history"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="background">Prior Knowledge / Background</Label>
                <Textarea
                  id="background"
                  placeholder="Describe your prior education or experience..."
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Daily Study Goal (minutes)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[dailyStudyMinutes]}
                    onValueChange={(v) => setDailyStudyMinutes(v[0])}
                    max={120}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{dailyStudyMinutes}m</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
