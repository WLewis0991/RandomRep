import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Calendar, Dumbbell, RefreshCcw, Target, TrendingUp } from "lucide-react";
import { PlanDisplay } from "../components/ui/PlanDisplay";
import { PlanHistory } from "../components/ui/PlanHistory";
import { Skeleton } from "../components/ui/Skeleton";
import type { PlanHistoryItem } from "../types/types";


function Profile() {
    const { user, isLoading, isDataLoading, plan, generatePlan } = useAuth();
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<PlanHistoryItem["planJson"] | null>(null);

    if (isLoading || (isDataLoading && !plan)) {
      return (
        <div className="min-h-screen pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-28" />
            <Skeleton className="h-64" />
            <Skeleton className="h-24" />
          </div>
        </div>
      );
    }
    if (!user) return <Navigate to="/auth/sign-in" replace />;
    if (!plan) return <Navigate to="/onboarding" replace />;

      function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const displayPlan = selectedPlan ?? plan;
  const isViewingPast = selectedPlan !== null;

  function handleSelect(item: PlanHistoryItem) {
    setSelectedPlan(item.planJson);
    setSelectedVersion(item.version);
  }

  function handleBackToLatest() {
    setSelectedPlan(null);
    setSelectedVersion(null);
  }

 return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {isViewingPast ? "Past Training Plan" : "Your Training Plan"}
            </h1>
            <p className="text-muted">
              Version {displayPlan.version} • Created {formatDate(displayPlan.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isViewingPast && (
              <Button
                variant="secondary"
                onClick={handleBackToLatest}
              >
                Back to Latest
              </Button>
            )}
            <Button
              variant="secondary"
              className="gap-2"
              disabled={isDataLoading || isViewingPast}
              onClick={async () => await generatePlan()}
            >
              <RefreshCcw className={`w-4 h-4 ${isDataLoading ? "animate-spin" : ""}`} />
              {isDataLoading ? "Generating..." : "Regenerate Plan"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Goal</p>
              <p className="font-medium text-sm">{displayPlan.overview.goal}</p>
            </div>
          </Card>
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Frequency</p>
              <p className="font-medium text-sm">{displayPlan.overview.frequency}</p>
            </div>
          </Card>
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Split</p>
              <p className="font-medium text-sm">{displayPlan.overview.split}</p>
            </div>
          </Card>
          <Card variant="bordered" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Version</p>
              <p className="font-medium text-sm">{displayPlan.version}</p>
            </div>
          </Card>
        </div>

        {/* Plan notes */}
        <Card variant="bordered" className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Program Notes</h2>
          <p className="text-muted text-sm leading-relaxed">
            {displayPlan.overview.notes}
          </p>
        </Card>

        {/* Weekly Schedule */}
        <h2 className="font-semibold text-xl mb-4">Weekly Schedule</h2>
        <PlanDisplay weeklySchedule={displayPlan.weeklySchedule} />

        <Card variant="bordered" className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Progression Strategy</h2>
          <p className="text-muted text-sm leading-relaxed">
            {displayPlan.progression}
          </p>
        </Card>

        {/* Plan History */}
        <PlanHistory
          currentVersion={plan.version}
          selectedVersion={selectedVersion}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}

export default Profile;