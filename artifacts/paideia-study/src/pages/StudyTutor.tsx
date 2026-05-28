import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useListStudyTutorConversations,
  useCreateStudyTutorConversation,
} from "@workspace/api-client-react";
import {
  ArrowLeft, MessageSquare, Plus, BrainCircuit, BookOpen,
  Target, Zap, Lightbulb, Clock
} from "lucide-react";

const QUICK_TOPICS = [
  "Explain a concept I'm struggling with",
  "Quiz me on my weakest areas",
  "Help me connect ideas across topics",
  "Walk me through a practice problem",
];

export default function StudyTutor() {
  const [, setLoc] = useLocation();
  const { data: conversations, isLoading } = useListStudyTutorConversations();
  const createMutation = useCreateStudyTutorConversation();
  const [starting, setStarting] = useState(false);

  const handleNewConversation = async (title?: string) => {
    setStarting(true);
    try {
      const res = await createMutation.mutateAsync({
        data: { title: title || "New Study Chat" },
      });
      setLoc(`/tutor/${res.id}`);
    } catch {
      alert("Failed to start tutor session.");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLoc("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => handleNewConversation()} disabled={starting}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">AI Socratic Tutor</h1>
          <p className="text-sm text-muted-foreground">
            Grounded in your knowledge graph and learning profile. Ask anything - or pick a quick start below.
          </p>
        </div>

        {/* Quick Start */}
        <div className="grid sm:grid-cols-2 gap-2 mb-6">
          {QUICK_TOPICS.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleNewConversation(topic)}
              disabled={starting}
              className="flex items-center gap-2.5 p-3 rounded-xl border bg-card text-left hover:border-primary/30 hover:bg-accent/50 transition-all"
            >
              {i === 0 && <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />}
              {i === 1 && <Target className="h-4 w-4 text-red-500 shrink-0" />}
              {i === 2 && <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />}
              {i === 3 && <Zap className="h-4 w-4 text-emerald-500 shrink-0" />}
              <span className="text-sm">{topic}</span>
            </button>
          ))}
        </div>

        {/* Conversations */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BrainCircuit className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No conversations yet</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                Your tutor knows all your materials, concepts, and learning patterns. Start a chat to get personalized help.
              </p>
              <Button onClick={() => handleNewConversation()} disabled={starting}>
                <Plus className="h-4 w-4 mr-2" />
                Start First Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Conversations</span>
              <Badge variant="outline" className="ml-auto text-[10px]">
                {conversations.length} total
              </Badge>
            </div>
            {conversations.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setLoc(`/tutor/${c.id}`)}
              >
                <CardContent className="py-3.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">{c.title || "Untitled Chat"}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
