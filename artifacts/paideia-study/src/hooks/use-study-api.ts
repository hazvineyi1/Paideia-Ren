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

// ─── Billing (mobile money + card) ───

export interface BillingMethod {
  id: string;
  label: string;
  kind: "mobile_money" | "card";
  requiresPhone: boolean;
  note?: string;
}

export type TierId = "plus" | "pro";

export interface TierPricing {
  plus: { month: number; year: number };
  pro: { month: number; year: number };
}

export interface BillingCountry {
  code: "ZW" | "ZA" | "ZM" | "BW";
  name: string;
  flag: string;
  currency: string;
  methods: BillingMethod[];
  price: TierPricing;
}

export interface BillingTier {
  id: TierId;
  name: string;
  tagline: string;
  features: string[];
}

export interface BillingConfig {
  countries: BillingCountry[];
  selected: BillingCountry | null;
  tiers: BillingTier[];
}

export interface CouponPreview {
  valid: boolean;
  reason?: string;
  code?: string;
  description?: string | null;
  discountMinor: number;
  finalMinor: number;
  currency: string;
  baseMinor: number;
}

export interface StudySubscription {
  tier: string;
  status: string;
  provider: string | null;
  interval: string | null;
  country: string | null;
  autoRenew: boolean;
  currentPeriodEnd: string | null;
}

export interface MobileCheckoutInput {
  tier: TierId;
  interval: "month" | "year";
  country: string;
  method: string;
  mobileNumber?: string;
  autoRenew?: boolean;
  couponCode?: string;
}

export interface MobileCheckoutResult {
  paymentId: string;
  provider: string;
  sandbox: boolean;
  status: "pending" | "paid" | "failed";
  redirectUrl: string | null;
  instructions: string | null;
  requiresPolling: boolean;
}

export interface PaymentStatusResult {
  status: "pending" | "paid" | "failed";
  paid: boolean;
  instructions?: string | null;
  subscription?: StudySubscription;
}

export interface CardCheckoutResult {
  url: string;
}

export function useStudyBillingConfig() {
  return useQuery<BillingConfig, ErrorType<unknown>>({
    queryKey: ["studyBillingConfig"],
    queryFn: async () => customFetch<BillingConfig>(`${BASE}/billing/config`),
  });
}

export function useStudySubscription() {
  return useQuery<StudySubscription, ErrorType<unknown>>({
    queryKey: ["studySubscription"],
    queryFn: async () => customFetch<StudySubscription>(`${BASE}/billing/subscription`),
  });
}

export function useStudyMobileCheckout() {
  return useMutation<MobileCheckoutResult, ErrorType<unknown>, MobileCheckoutInput>({
    mutationKey: ["studyMobileCheckout"],
    mutationFn: async (data) =>
      customFetch<MobileCheckoutResult>(`${BASE}/billing/mobile/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useStudyCardCheckout() {
  return useMutation<
    CardCheckoutResult,
    ErrorType<unknown>,
    { tier: TierId; interval: "month" | "year" }
  >({
    mutationKey: ["studyCardCheckout"],
    mutationFn: async (data) =>
      customFetch<CardCheckoutResult>(`${BASE}/billing/card/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export interface CouponPreviewInput {
  code: string;
  tier: TierId;
  country: string;
  interval: "month" | "year";
}

export function useStudyCouponPreview() {
  return useMutation<CouponPreview, ErrorType<unknown>, CouponPreviewInput>({
    mutationKey: ["studyCouponPreview"],
    mutationFn: async (data) =>
      customFetch<CouponPreview>(`${BASE}/billing/coupon/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

// ─── Admin: coupons ───

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "percent" | "fixed";
  percentOff: number | null;
  amountOffMinor: number | null;
  currency: string | null;
  appliesToTier: "plus" | "pro" | null;
  active: boolean;
  maxRedemptions: number | null;
  timesRedeemed: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface AdminCouponInput {
  code: string;
  description?: string | null;
  discountType: "percent" | "fixed";
  percentOff?: number | null;
  amountOffMinor?: number | null;
  currency?: string | null;
  appliesToTier?: "plus" | "pro" | null;
  active?: boolean;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
}

export function useStudyAdminCoupons() {
  return useQuery<{ coupons: AdminCoupon[] }, ErrorType<unknown>>({
    queryKey: ["studyAdminCoupons"],
    queryFn: async () => customFetch<{ coupons: AdminCoupon[] }>(`${BASE}/admin/coupons`),
  });
}

export function useStudyCreateCoupon() {
  return useMutation<{ coupon: AdminCoupon }, ErrorType<unknown>, AdminCouponInput>({
    mutationKey: ["studyCreateCoupon"],
    mutationFn: async (data) =>
      customFetch<{ coupon: AdminCoupon }>(`${BASE}/admin/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useStudyUpdateCoupon() {
  return useMutation<
    { coupon: AdminCoupon },
    ErrorType<unknown>,
    { id: string } & AdminCouponInput
  >({
    mutationKey: ["studyUpdateCoupon"],
    mutationFn: async ({ id, ...data }) =>
      customFetch<{ coupon: AdminCoupon }>(`${BASE}/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useStudyDeleteCoupon() {
  return useMutation<{ ok: true }, ErrorType<unknown>, string>({
    mutationKey: ["studyDeleteCoupon"],
    mutationFn: async (id) =>
      customFetch<{ ok: true }>(`${BASE}/admin/coupons/${id}`, { method: "DELETE" }),
  });
}

export function useStudyPaymentStatus(paymentId: string | null) {
  return useQuery<PaymentStatusResult, ErrorType<unknown>>({
    queryKey: ["studyPaymentStatus", paymentId],
    enabled: !!paymentId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && (data.status === "paid" || data.status === "failed") ? false : 3000;
    },
    queryFn: async () => customFetch<PaymentStatusResult>(`${BASE}/billing/payment/${paymentId}`),
  });
}

export function useStudyCancelSubscription() {
  return useMutation<StudySubscription, ErrorType<unknown>, void>({
    mutationKey: ["studyCancelSubscription"],
    mutationFn: async () =>
      customFetch<StudySubscription>(`${BASE}/billing/cancel`, { method: "POST" }),
  });
}
