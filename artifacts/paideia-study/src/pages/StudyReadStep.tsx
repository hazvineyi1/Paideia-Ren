import { useLocation, useParams } from "wouter";
import { useStudyPath, useCompletePathStep } from "@/hooks/use-study-journey";
import { useListStudyConcepts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Loader2, Sparkles } from "lucide-react";
import StudyNav from "@/components/StudyNav";
import { useState } from "react";

export default function StudyReadStep() {
  const { pathId, stepId } = useParams<{ pathId: string; stepId: string }>();
  const [, setLoc] = useLocation();
  const { data: pathData, isLoading: pathLoading } = useStudyPath(pathId);
  const completeStep = useCompletePathStep();
  const [completing, setCompleting] = useState(false);

  const step = pathData?.steps?.find((s: any) => s.id === stepId) ?? null;
  const materialId = step?.contentRef ?? null;
  const conceptId = step?.conceptId ?? null;
  const { data: concepts, isLoading: conceptsLoading } = useListStudyConcepts(materialId ?? undefined);

  const concept = concepts?.find((c: any) => c.id === conceptId) ?? null;

  // Position in path so the learner sees "Step X of Y"
  const stepIndex = pathData?.steps?.findIndex((s: any) => s.id === stepId) ?? -1;
  const totalSteps = pathData?.steps?.length ?? 0;

  const onContinue = async () => {
    if (!pathId || !stepId) return;
    setCompleting(true);
    try {
      await completeStep.mutateAsync({ pathId, stepId, masteryScore: 1 });
      // Back to dashboard — daily-session query is invalidated by the mutation
      setLoc("/dashboard");
    } catch {
      setCompleting(false);
      alert("Couldn't mark this step complete. Please try again.");
    }
  };

  const loading = pathLoading || conceptsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <StudyNav />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => setLoc("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to today
        </button>

        {loading ? (
          <Card>
            <CardContent className="p-8 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading your reading…
            </CardContent>
          </Card>
        ) : !step ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-700">
              <p className="font-semibold mb-2">We couldn't find this step.</p>
              <p className="text-sm text-gray-500 mb-4">It may have been completed or removed.</p>
              <Button onClick={() => setLoc("/dashboard")}>Back to today</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-blue-700 font-semibold">
                <Sparkles className="w-4 h-4" /> AI-led step
              </div>
              {totalSteps > 0 && stepIndex >= 0 && (
                <div className="text-xs text-gray-500">
                  Step {stepIndex + 1} of {totalSteps}
                </div>
              )}
            </div>

            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Read & Understand</div>
                    <div className="font-semibold text-gray-900">
                      {concept?.title ?? step.title.replace(/^Read & Understand:\s*/i, "")}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {step.estimatedMinutes}m
                  </div>
                </div>

                {concept?.difficulty && (
                  <Badge variant="secondary" className="mb-3">{concept.difficulty}</Badge>
                )}

                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                  {concept ? (
                    <p className="whitespace-pre-wrap">{concept.explanation}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      This step's concept content isn't available — you can still mark it read and continue.
                    </p>
                  )}
                </div>

                {Array.isArray(concept?.keyTerms) && concept!.keyTerms.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Key terms</div>
                    <div className="flex flex-wrap gap-2">
                      {concept!.keyTerms.map((t: string) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              disabled={completing}
              onClick={onContinue}
            >
              {completing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Marking complete…</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Mark read & continue</>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-3">
              Your AI coach will queue the next step (recall, practice, or mastery check) automatically.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
