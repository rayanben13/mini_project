"use client";

import SuggestionInput from "@/components/SuggestionInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSuggestions } from "@/hooks/useSuggestions";
import useAuthStore from "@/Store/AuthStore";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// --- Types ---
type Mode = "univ" | "major" | "specialty" | "subject";

// --- Steps Config ---
const STEPS = [
  {
    id: 1,
    title: "Welcome! 👋",
    description: "Let's set up your profile to personalize your experience.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Your University",
    description: "Search and select your university.",
    icon: GraduationCap,
  },
  {
    id: 3,
    title: "Your Major",
    description: "What are you studying?",
    icon: BookOpen,
  },
  {
    id: 4,
    title: "Final Details",
    description: "Tell us your year and specialty.",
    icon: BookOpen,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { addedUserInformation } = useAuthStore();

  // ====== Step State ======
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ====== Form Data ======
  const [formData, setFormData] = useState({
    univ: "",
    major: "",
    specialty: "",
    academic_year: "",
  });

  // ====== Suggestions Hooks (instance منفصلة لكل حقل) ======
  const {
    suggestions: univSuggestions,
    isSuggestionsLoading: isUnivLoading,
    fetchSuggestions: fetchUnivSuggestions,
    clearSuggestions: clearUnivSuggestions,
  } = useSuggestions();

  const {
    suggestions: majorSuggestions,
    isSuggestionsLoading: isMajorLoading,
    fetchSuggestions: fetchMajorSuggestions,
    clearSuggestions: clearMajorSuggestions,
  } = useSuggestions();

  const {
    suggestions: specialtySuggestions,
    isSuggestionsLoading: isSpecialtyLoading,
    fetchSuggestions: fetchSpecialtySuggestions,
    clearSuggestions: clearSpecialtySuggestions,
  } = useSuggestions();

  // ====== Handlers ======
  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // التحقق من صحة كل خطوة قبل الانتقال
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return true; // خطوة الترحيب لا تحتاج تحقق
      case 2:
        return formData.univ.trim().length >= 2;
      case 3:
        return formData.major.trim().length >= 2;
      case 4:
        return formData.academic_year !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error("Please fill in the required field before proceeding.");
      return;
    }
    if (step < STEPS.length) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    if (!canProceed()) {
      toast.error("Please select your academic year.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addedUserInformation({
        univ: formData.univ,
        major: formData.major,
        specialty: formData.specialty,
        academic_year: formData.academic_year,
      });

      if (result.success) {
        toast.success("Profile completed! Welcome aboard 🎉");
        router.push("/dashboard");
      } else {
        toast.error(result.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== Progress ======
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">

        {/* ====== Progress Bar ====== */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
            <span>Step {step} of {STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0975e6] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ====== Step Indicators ====== */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${s.id < step
                    ? "bg-[#0975e6] text-white"           // مكتمل
                    : s.id === step
                      ? "bg-[#0975e6]/10 border-2 border-[#0975e6] text-[#0975e6]" // حالي
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400" // قادم
                  }
                `}
              >
                {s.id < step ? <Check className="w-4 h-4" /> : s.id}
              </div>
              {/* الخط بين الخطوات */}
              {s.id < STEPS.length && (
                <div
                  className={`w-8 h-0.5 rounded-full transition-all duration-500 ${s.id < step
                      ? "bg-[#0975e6]"
                      : "bg-slate-200 dark:bg-slate-700"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ====== Main Card ====== */}
        <Card className="border border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl">
          <CardHeader className="text-center pb-4 pt-8 px-8">
            {/* أيقونة الخطوة */}
            <div className="w-16 h-16 bg-[#0975e6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-8 h-8 text-[#0975e6]" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentStep.title}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
              {currentStep.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-5">

            {/* ====== Step 1: Welcome ====== */}
            {step === 1 && (
              <div className="space-y-4 text-center">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  We need a few details to personalize your learning experience
                  and show you relevant study materials.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { emoji: "📚", label: "Find Materials" },
                    { emoji: "🎯", label: "Track Progress" },
                    { emoji: "🤝", label: "Connect" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center"
                    >
                      <p className="text-2xl mb-1">{item.emoji}</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ====== Step 2: University ====== */}
            {step === 2 && (
              <SuggestionInput
                label="University Name"
                placeholder="e.g. University of Algiers..."
                value={formData.univ}
                onChange={(val) => {
                  updateFormData("univ", val);
                  // إعادة تعيين الخطوات التالية عند تغيير الجامعة
                  updateFormData("major", "");
                  updateFormData("specialty", "");
                  clearMajorSuggestions();
                  clearSpecialtySuggestions();
                }}
                onFetch={(val) => fetchUnivSuggestions("univ", val)}
                suggestions={univSuggestions}
                isLoading={isUnivLoading}
              />
            )}

            {/* ====== Step 3: Major & Specialty ====== */}
            {step === 3 && (
              <div className="space-y-4">
                <SuggestionInput
                  label="Major"
                  placeholder="e.g. Computer Science..."
                  value={formData.major}
                  onChange={(val) => {
                    updateFormData("major", val);
                    // إعادة تعيين الـ specialty عند تغيير الـ major
                    updateFormData("specialty", "");
                    clearSpecialtySuggestions();
                  }}
                  onFetch={(val) =>
                    fetchMajorSuggestions("major", val, { univ: formData.univ })
                  }
                  suggestions={majorSuggestions}
                  isLoading={isMajorLoading}
                />
              </div>
            )}

            {/* ====== Step 4: Academic Year ====== */}
            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Select your current academic year:
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {["L1", "L2", "L3", "M1", "M2"].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        updateFormData("academic_year", year);
                        // Clear specialty if switching to L years
                        if (["L1", "L2", "L3"].includes(year)) {
                          updateFormData("specialty", "");
                        }
                      }}
                      className={`
                        py-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200
                        ${formData.academic_year === year
                          ? "border-[#0975e6] bg-[#0975e6]/10 text-[#0975e6] scale-105 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-[#0975e6]/50 hover:text-[#0975e6]"
                        }
                      `}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                {/* ====== Specialty (Shown only for M1, M2) ====== */}
                {formData.academic_year && !["L1", "L2", "L3"].includes(formData.academic_year) && (
                  <div className="pt-4">
                    <SuggestionInput
                      label="Specialization"
                      placeholder="e.g. Software Engineering..."
                      value={formData.specialty}
                      onChange={(val) => updateFormData("specialty", val)}
                      onFetch={(val) =>
                        fetchSpecialtySuggestions("specialty", val, {
                          univ: formData.univ,
                          major: formData.major,
                          year: formData.academic_year,
                        })
                      }
                      suggestions={specialtySuggestions}
                      isLoading={isSpecialtyLoading}
                    />
                  </div>
                )}

                {/* ملخص البيانات */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Summary
                  </p>
                  {[
                    { label: "University", value: formData.univ },
                    { label: "Major", value: formData.major },
                    ...(formData.academic_year && !["L1", "L2", "L3"].includes(formData.academic_year)
                      ? [
                        {
                          label: "Specialization",
                          value: formData.specialty || "Not specified",
                        },
                      ]
                      : []),
                    { label: "Year", value: formData.academic_year || "Not selected" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 max-w-[60%] text-right truncate">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ====== Navigation Buttons ====== */}
            <div className="flex gap-3 pt-4">
              {/* زر Back */}
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}

              {/* زر Next أو Finish */}
              {step < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 rounded-xl bg-[#0975e6] hover:bg-[#0975e6]/90 gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinish}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 rounded-xl bg-[#0975e6] hover:bg-[#0975e6]/90 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>

          </CardContent>
        </Card>

        {/* ====== Footer ====== */}
        <p className="text-center text-xs text-slate-400">
          You can update this information later in your profile settings.
        </p>

      </div>
    </div>
  );
}