import { AlertTriangle, Zap, Crown, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface RunsDisplayProps {
  planTier: string;
  runsUsed: number;
  runLimit: number;
  runsRemaining: number;
  canRun: boolean;
  isPromoUser: boolean;
  showWarning: boolean;
}

const RunsDisplay = ({
  planTier,
  runsUsed,
  runLimit,
  runsRemaining,
  canRun,
  isPromoUser,
  showWarning,
}: RunsDisplayProps) => {
  const navigate = useNavigate();
  const isFree = planTier === "free";
  const isPro = planTier === "pro";

  return (
    <div className={`bg-card border rounded-lg p-4 ${showWarning ? "border-destructive/50" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isPromoUser ? "bg-accent/10" : isFree ? "bg-muted" : "bg-accent/10"
          }`}>
            {isPromoUser ? (
              <Crown className="w-5 h-5 text-accent" />
            ) : (
              <Zap className="w-5 h-5 text-accent" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold font-display text-card-foreground">
                {runsUsed}
              </p>
              <span className="text-sm text-muted-foreground">
                / {isPro && !isFree ? <Infinity className="w-4 h-4 inline" /> : runLimit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPromoUser
                ? "Promo — Unlimited Access"
                : isFree
                ? `${runsRemaining} run${runsRemaining !== 1 ? "s" : ""} remaining this month`
                : `Runs used this month (${planTier.charAt(0).toUpperCase() + planTier.slice(1)})`}
            </p>
          </div>
        </div>

        {isFree && !isPromoUser && !canRun && (
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/pricing")}
          >
            Upgrade
          </Button>
        )}
      </div>

      {showWarning && (
        <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            You're approaching your {planTier === "basic" ? "10" : "90"}-run monthly limit. Consider upgrading.
          </span>
        </div>
      )}

      {isFree && !isPromoUser && !canRun && (
        <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Free tier limit reached. Upgrade to continue using PM Wizard.</span>
        </div>
      )}
    </div>
  );
};

export default RunsDisplay;
