import { RedirectToSignIn, SignedIn } from "@neondatabase/auth/react";
import { useAuth } from "../context/useAuth";

const goalOptions = [
  { value: "bulk", label: "Build Muscle (Bulk)"},
  { value: "cut", label: "Lose Fat (Cut)"},
  { value: "recomp", label: "Body Recomp"},
  { value: "strength", label: "Build Strength"},
  { value: "endurance", label: "Improve Endurance"},
];

const experienceOptions = [
  { value: "beginner", label: "Beginner (0-1 year)"},
  { value: "intermediate", label: "Intermediate (1-3 years)"},
  { value: "advanced", label: "Advanced (3+ years)"},
];

const daysOptions = [
  { value: "2", label: "2 days per week"},
  { value: "3", label: "3 days per week"},
  { value: "4", label: "4 days per week"},
  { value: "5", label: "5 days per week"},
  { value: "6", label: "6 days per week"},
];

const sessionLength = [
  { value: "30", label: "30 minutes"},
  { value: "45", label: "45 minutes"},
  { value: "60", label: "60 minutes"},
  { value: "90", label: "90 minutes"},
];

const equipmentOptions = [
  { value: "full_gym", label: "Full Gym Access"},
  { value: "home", label: "Basic Home Gym"},
  { value: "dumbbells", label: "Dumbbells Only"},
];

const splitOptions = [
  { value: "full_body", label: "Full Body"},
  { value: "upper_body", label: "Upper/Lower Split"},
  { value: "ppl", label: "Push/Pull/Legs"},
  { value: "custom", label: "Let AI Decide"},
];

function Onboarding() {
  const{user} = useAuth();

  if (!user) {
    return <RedirectToSignIn />;
  }

  return (
    <SignedIn>
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-l mx-auto">
          {/* Progress Indicator */ } 

          { /* Step 1: Questions */ }

          { /* Step 2: AI Generation */ }
        </div>
      </div>
    </SignedIn>
  );
}

export default Onboarding;
