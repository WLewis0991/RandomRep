import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import type { PlanHistoryItem } from "../../types/types";
import { api } from "../../lib/api";
import { Card } from "./Card";

interface PlanHistoryProps {
  currentVersion: number;
  onSelect: (item: PlanHistoryItem) => void;
  selectedVersion: number | null;
}

export function PlanHistory({
  currentVersion,
  onSelect,
  selectedVersion,
}: PlanHistoryProps) {
  const [plans, setPlans] = useState<PlanHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res: { plans: PlanHistoryItem[] } = await api.getPlanHistory();
      setPlans(res.plans ?? []);
    } catch {
      setError("Couldn't load plan history.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <Card variant="bordered">
      <button
        type="button"
        onClick={loadHistory}
        className="w-full flex items-center justify-between py-1"
      >
        <span className="flex items-center gap-2 font-semibold text-lg">
          <History className="w-5 h-5 text-accent" />
          Plan History
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-4">
          {loading && <p className="text-sm text-muted">Loading...</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!loading && !error && plans.length === 0 && (
            <p className="text-sm text-muted">No previous plans yet.</p>
          )}
          <ul className="divide-y divide-border">
            {plans.map((plan) => {
              const isCurrent = plan.version === currentVersion;
              const isSelected = plan.version === selectedVersion;
              return (
                <li key={plan.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(plan)}
                    className={`w-full text-left px-2 py-3 rounded-lg transition-colors ${
                      isSelected ? "bg-accent/10" : "hover:bg-border/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        Version {plan.version}
                        {isCurrent && (
                          <span className="ml-2 text-xs text-accent">(current)</span>
                        )}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDate(plan.createdAt)}
                      </span>
                    </div>
                    {plan.planJson?.overview && (
                      <p className="text-xs text-muted mt-1">
                        {plan.planJson.overview.goal} • {plan.planJson.overview.split} •{" "}
                        {plan.planJson.overview.frequency}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}