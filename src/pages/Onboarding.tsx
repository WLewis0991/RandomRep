import { RedirectToSignIn, SignedIn } from "@neondatabase/auth/react";
import { useAuth } from "../context/useAuth";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { ArrowRight } from "lucide-react";


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
  const [formData, setFormData] = useState({
    goal:"bulk",
    experience:"intermediate",
    daysPerWeek:"4",
    sessionLength:"60",
    equipment:"full_gym",
    injuries:"",
    prefferedSplit: "upper_lower",

  });

  function updateForm(field: string, value: string) {
    setFormData((prev) => ({...prev, [field]: value }));
  }

  if (!user) {
    return <RedirectToSignIn />;
  }

  async function handleFormSubmit(e: React.SubmitEvent) {
    e.preventDefault();

  }

  return (
    <SignedIn>
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-l mx-auto">
          {/* Progress Indicator */ } 

          { /* Step 1: Questions */ }
          <Card variant="bordered">
            <h1 className="text-2xl font-bold mb-2">Tell Us About Yourself</h1>
            <p className="text-muted mb-6">Lets create the perfect pln for you.</p>
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <Select id="goal" label="Whats your primary goal?" options={goalOptions} value={formData.goal} onChange={(e) => updateForm("goal", e.target.value)}/>
              <Select id="experience" label="Training experience" options={experienceOptions} value={formData.experience} onChange={(e) => updateForm("experience", e.target.value)}/>
              <div className="grid grid-cols-2 space-x-5">
                <Select id="daysPerWeek" label="Days per week" options={daysOptions} value={formData.daysPerWeek} onChange={(e) => updateForm("daysPerWeek", e.target.value)}/>
                <Select id="sessionLength" label="Session length" options={sessionLength} value={formData.sessionLength} onChange={(e) => updateForm("sessionLength", e.target.value)}/>
              </div> 
              <Select id="equipment" label="Equipment access" options={equipmentOptions} value={formData.equipment} onChange={(e) => updateForm("equipment", e.target.value)}/>
              <Select id="preferredSplit" label="Preferred training split" options={splitOptions} value={formData.prefferedSplit} onChange={(e) => updateForm("preferredSplit", e.target.value)}/> 
              <Textarea id="injures" label="Any injuries nad limitations? (optional)" rows={3} value={formData.injuries} onChange={(e) => updateForm("injureies", e.target.value)} />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 gap-2">
                  Generate My Plan <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
          

          { /* Step 2: AI Generation */ }
        </div>
      </div>
    </SignedIn>
  );
}

export default Onboarding;
