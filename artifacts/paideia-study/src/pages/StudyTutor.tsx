import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useListStudyTutorConversations,
  useCreateStudyTutorConversation,
} from "@workspace/api-client-react";
import { ArrowLeft, MessageSquare, Plus, BrainCircuit } from "lucide-react";

export default function StudyTutor() {
  const [, setLoc] = useLocation();
  const { data: conversations, isLoading } = useListStudyTutorConversations();
  const createMutation = useCreateStudyTutorConversation();
  const [starting, setStarting] = useState(false);

  const handleNewConversation = async () => {
    setStarting(true);
    try {
      const res = await createMutation.mutateAsync({
        data: { title: "New Study Chat" },
      });
      setLoc(`/tutor/${res.id}`);
    } catch {
      alert("Failed to start tutor session.");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button size="sm" onClick={handleNewConversation} disabled={starting}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <BrainCircuit className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">AI Study Tutor</h1>
          <p className="text-muted-foreground mt-1">
            Socratic tutor grounded in your learner profile and materials.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No conversations yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start a new chat to ask anything about your study topics.
              </p>
              <Button onClick={handleNewConversation} disabled={starting}>
                <Plus className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer hover-elevate"
                onClick={() => setLoc(`/tutor/${c.id}`)}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{c.title || "Untitled Chat"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
