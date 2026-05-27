import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateStudyMaterial,
  getListStudyMaterialsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, FileText, Link2 } from "lucide-react";

export default function StudyMaterialNew() {
  const [, setLoc] = useLocation();
  const createMutation = useCreateStudyMaterial();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (sourceType: "paste" | "url") => {
    if (!title || (!content && sourceType === "paste")) return;
    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        data: {
          title,
          sourceType,
          sourceUrl: sourceType === "url" ? sourceUrl || null : null,
          contentText: content || sourceUrl || "",
        },
      });
      queryClient.invalidateQueries({ queryKey: getListStudyMaterialsQueryKey() });
      setLoc("/materials");
    } catch (err: any) {
      alert(err?.data?.error || "Failed to add material");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => setLoc("/materials")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Materials
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Add Study Material</h1>
        <p className="text-muted-foreground mb-6">
          Paste notes, paste a link, or describe a topic. AI will extract concepts and generate flashcards.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Biology - Cell Structure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">
              <FileText className="h-4 w-4 mr-2" />
              Paste Notes
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 className="h-4 w-4 mr-2" />
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Paste your study notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste lecture notes, textbook content, or any study material here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <Button
                  className="w-full mt-4"
                  disabled={!title || !content || submitting}
                  onClick={() => handleSubmit("paste")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {submitting ? "Processing..." : "Generate Concepts & Flashcards"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="url">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Link to study material</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2 mb-4">
                  Paste the URL to an article, Wikipedia page, or online resource.
                </p>
                <Button
                  className="w-full"
                  disabled={!title || !sourceUrl || submitting}
                  onClick={() => handleSubmit("url")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {submitting ? "Processing..." : "Generate from URL"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
