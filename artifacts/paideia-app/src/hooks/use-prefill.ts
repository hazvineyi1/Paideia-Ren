import { useSearch } from "wouter";
import { useMemo } from "react";

export interface Prefill {
  subject?: string;
  yearGroup?: string;
  topic?: string;
  fromPlanId?: string;
  fromPlanTitle?: string;
}

export function usePrefill(): Prefill {
  const search = useSearch();
  return useMemo(() => {
    const p = new URLSearchParams(search);
    const out: Prefill = {};
    const subject = p.get("subject"); if (subject) out.subject = subject;
    const yearGroup = p.get("yearGroup"); if (yearGroup) out.yearGroup = yearGroup;
    const topic = p.get("topic"); if (topic) out.topic = topic;
    const fromPlanId = p.get("fromPlanId"); if (fromPlanId) out.fromPlanId = fromPlanId;
    const fromPlanTitle = p.get("fromPlanTitle"); if (fromPlanTitle) out.fromPlanTitle = fromPlanTitle;
    return out;
  }, [search]);
}
