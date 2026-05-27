import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListStudyMaterials, useDeleteStudyMaterial, getListStudyMaterialsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, BookOpen, FileText, ArrowLeft, Layers, Sparkles } from "lucide-react";

export default function StudyMaterials() {
  const [, setLoc] = useLocation();
  const { data: materials, isLoading } = useListStudyMaterials();
  const deleteMutation = useDeleteStudyMaterial();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material and all its concepts/flashcards?")) return;
    await deleteMutation.mutateAsync({ materialId: id });
    queryClient.invalidateQueries({ queryKey: getListStudyMaterialsQueryKey() });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button size="sm" onClick={() => setLoc("/materials/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Study Materials</h1>
        <p className="text-muted-foreground mb-6">
          Paste notes, paste URLs, or describe topics to generate flashcards and concepts.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !materials || materials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No materials yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add your notes, textbook chapters, or any study content.
              </p>
              <Button onClick={() => setLoc("/materials/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {materials.map((m) => (
              <Card key={m.id} className="group">
                <CardContent className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold truncate">{m.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {m.conceptCount} concepts
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {m.flashcardCount} flashcards
                      </span>
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
