import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface Subscription {
  id: string;
  user_id: string;
  plan_tier: string;
  promo_code: string | null;
  runs_used: number;
  runs_reset_at: string;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  basic: 50,
  pro: 999999, // unlimited
};

const WARNING_THRESHOLDS: Record<string, number> = {
  basic: 10,
  pro: 90,
};

export function getRunLimit(planTier: string): number {
  return PLAN_LIMITS[planTier] ?? 3;
}

export function getWarningThreshold(planTier: string): number | null {
  return WARNING_THRESHOLDS[planTier] ?? null;
}

export function useSubscription() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async (): Promise<Subscription | null> => {
      if (!userId) return null;

      // Check if month has rolled over, reset runs if needed
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        // Create subscription for existing users
        const { data: newSub } = await supabase
          .from("subscriptions")
          .insert({ user_id: userId, plan_tier: "free" })
          .select()
          .single();
        return newSub as Subscription | null;
      }

      // Reset runs if we're in a new month
      const resetDate = new Date(data.runs_reset_at);
      const now = new Date();
      if (resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear()) {
        const { data: updated } = await supabase
          .from("subscriptions")
          .update({ runs_used: 0, runs_reset_at: new Date().toISOString() })
          .eq("id", data.id)
          .select()
          .single();
        return updated as Subscription | null;
      }

      return data as Subscription;
    },
    enabled: !!userId,
  });

  const incrementRuns = async () => {
    if (!subscription) return;
    await supabase
      .from("subscriptions")
      .update({ runs_used: subscription.runs_used + 1 })
      .eq("id", subscription.id);
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  };

  const isPromoUser = subscription?.promo_code === "100DisPromo";
  const planTier = subscription?.plan_tier ?? "free";
  const runsUsed = subscription?.runs_used ?? 0;
  const runLimit = getRunLimit(planTier);
  const canRun = isPromoUser || runsUsed < runLimit;
  const runsRemaining = Math.max(0, runLimit - runsUsed);
  const warningThreshold = getWarningThreshold(planTier);
  const showWarning = !isPromoUser && warningThreshold !== null && runsUsed >= warningThreshold;

  return {
    subscription,
    isLoading,
    planTier,
    runsUsed,
    runLimit,
    runsRemaining,
    canRun,
    isPromoUser,
    showWarning,
    warningThreshold,
    incrementRuns,
  };
}
