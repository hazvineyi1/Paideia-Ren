import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetStudyTutorConversation,
  useSendStudyTutorMessage,
} from "@workspace/api-client-react";
import { ArrowLeft, Send, BrainCircuit, Lightbulb } from "lucide-react";
import type { StudyTutorMessage } from "@workspace/api-client-react";

export default function StudyTutorChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [, setLoc] = useLocation();
  const { data: detail, isLoading } = useGetStudyTutorConversation(conversationId);
  const sendMutation = useSendStudyTutorMessage();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = detail?.conversation;
  const messages = detail?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await sendMutation.mutateAsync({
        conversationId,
        data: { content: input.trim() },
      });
      setInput("");
    } catch {
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLoc("/tutor")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tutor
          </Button>
          <h1 className="font-semibold text-sm">
            {conversation?.title || "Study Tutor"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Socratic Mode
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-3xl mx-auto w-full">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-12">
            <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Ask me anything</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              I know your materials, concepts, and learning profile. Ask about any topic you're studying.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: StudyTutorMessage) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t px-6 py-4 shrink-0 max-w-3xl mx-auto w-full">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about a concept, exam strategy, or anything else..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
