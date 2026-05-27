import { useQuery, useMutation } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import type { ErrorType } from "@workspace/api-client-react";

const BASE = "/api/study";

// ─── Knowledge Graph ───

export interface KnowledgeNode {
  id: string;
  userId: string;
  label: string;
  description: string | null;
  category: string | null;
  masteryLevel: number;
  confidenceScore: number;
  reviewCount: number;
  lastAssessedAt: string | null;
  createdAt: string;
}

export interface KnowledgeEdge {
  id: string;
  userId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
  strength: number;
  createdAt: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export function useStudyKnowledgeGraph() {
  return useQuery<KnowledgeGraphData, ErrorType<unknown>>({
    queryKey: ["studyKnowledgeGraph"],
    queryFn: async () => {
      const res = await customFetch<KnowledgeGraphData>(`${BASE}/knowledge/nodes`);
      const nodes = Array.isArray(res) ? res : [];
      const edgesRes = await customFetch<KnowledgeEdge[]>(`${BASE}/knowledge/edges`);
      const edges = Array.isArray(edgesRes) ? edgesRes : [];
      return { nodes, edges };
    },
  });
}

export function useStudyKnowledgeGenerate() {
  return useMutation<KnowledgeGraphData, ErrorType<unknown>, { materialId: string }>({
    mutationKey: ["studyKnowledgeGenerate"],
    mutationFn: async ({ materialId }) => {
      const res = await customFetch<KnowledgeGraphData>(`${BASE}/knowledge/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      return res;
    },
  });
}

// ─── Adaptive Engine ───

export interface AdaptiveRecommendation {
  type: string;
  title: string;
  description: string;
  priority: number;
  action: string;
  reason: string;
}

export interface AdaptiveRecommendations {
  recommendations: AdaptiveRecommendation[];
  dueFlashcards: number;
  weakConcepts: number;
  activePathId: string | null;
  lastActivity: string | null;
}

export function useStudyAdaptiveRecommendations() {
  return useQuery<AdaptiveRecommendations, ErrorType<unknown>>({
    queryKey: ["studyAdaptiveRecommendations"],
    queryFn: async () => {
      return customFetch<AdaptiveRecommendations>(`${BASE}/adaptive/recommendations`);
    },
  });
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  goal: string | null;
  status: string;
  nodeSequence: Array<{
    nodeId: string;
    order: number;
    estimatedMinutes: number;
    status: "pending" | "in_progress" | "completed";
  }>;
  totalEstimatedMinutes: number;
  completedMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export function useStudyLearningPaths() {
  return useQuery<LearningPath[], ErrorType<unknown>>({
    queryKey: ["studyLearningPaths"],
    queryFn: async () => customFetch<LearningPath[]>(`${BASE}/adaptive/learning-paths`),
  });
}

export function useStudyCreateLearningPath() {
  return useMutation<LearningPath, ErrorType<unknown>, { title: string; description?: string; goal?: string; materialIds?: string[] }>({
    mutationKey: ["studyCreateLearningPath"],
    mutationFn: async (data) =>
      customFetch<LearningPath>(`${BASE}/adaptive/learning-paths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

// ─── Activity Log ───

export function useStudyLogActivity() {
  return useMutation<unknown, ErrorType<unknown>, {
    activityType: string;
    entityId?: string;
    entityType?: string;
    durationSeconds?: number;
    accuracy?: number;
    confidence?: number;
    difficulty?: string;
    conceptIds?: string[];
    metadata?: Record<string, unknown>;
  }>({
    mutationKey: ["studyLogActivity"],
    mutationFn: async (data) =>
      customFetch<unknown>(`${BASE}/adaptive/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}
