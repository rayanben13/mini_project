"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_CONFIG } from "@/constants/apiConfig";
import useAuthStore from "@/Store/AuthStore";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";

// --- Types ---
type Mode = "univ" | "major" | "Specialty" | "subject";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // البيانات التي سيتم إرسالها للـ Backend
  const [formData, setFormData] = useState({
    univ: "",
    major: "",
    specialty: "",
    academic_year: "",
  });

  const searchCache = useRef<Record<string, string[]>>({});

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(
    async (mode: Mode, name: string, extra = {}) => {
      if (name.length < 2) {
        setSuggestions([]);
        return;
      }

      const cacheKey = `${mode}-${name}-${JSON.stringify(extra)}`;

      if (searchCache.current[cacheKey]) {
        setSuggestions(searchCache.current[cacheKey]);
        return;
      }

      // 4. تطبيق الـ Debounce (انتظار 300ms قبل إرسال الطلب)
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        try {
          const query = new URLSearchParams({ mode, name, ...extra });
          const res = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH_INFO}?${query.toString()}`,
          );
          const data = await res.json();

          const results =
            data.universities || data.majors || data.Specialty || [];

          // 5. تخزين النتيجة في الكاش للاستخدام المستقبلي
          searchCache.current[cacheKey] = results;
          setSuggestions(results);
        } catch (error) {
          console.error("Search error:", error);
        }
      }, 300);
    },
    [],
  );

  // دالة الحفظ النهائي (addedUserInformation)
  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_USER_INFO}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`, // تأكد من إرسال التوكن
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile completed!");
        router.push("/profile");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              Step {step} of 3
            </span>
          </div>
          <CardTitle className="text-2xl">Academic Information</CardTitle>
          <CardDescription>Help us personalize your experience</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* STEP 1: University */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <label className="text-sm font-medium">
                Which University do you attend?
              </label>
              <Input
                placeholder="Start typing university name..."
                value={formData.univ}
                onChange={(e) => {
                  setFormData({ ...formData, univ: e.target.value });
                  fetchSuggestions("univ", e.target.value);
                }}
              />
              <SuggestionList
                list={suggestions}
                onSelect={(val) => {
                  setFormData({ ...formData, univ: val });
                  setSuggestions([]);
                  setStep(2);
                }}
              />
            </div>
          )}

          {/* STEP 2: Major & Year */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <label className="text-sm font-medium">What is your Major?</label>
              <Input
                placeholder="Search major (e.g. Computer Science)"
                value={formData.major}
                onChange={(e) => {
                  setFormData({ ...formData, major: e.target.value });
                  fetchSuggestions("major", e.target.value);
                }}
              />
              <SuggestionList
                list={suggestions}
                onSelect={(val) => {
                  setFormData({ ...formData, major: val });
                  setSuggestions([]);
                }}
              />

              <label className="text-sm font-medium block mt-4">
                Academic Year
              </label>
              <select
                className="w-full p-2 border rounded-md dark:bg-gray-800"
                value={formData.academic_year}
                onChange={(e) =>
                  setFormData({ ...formData, academic_year: e.target.value })
                }
              >
                <option value="">Select Year</option>
                <option value="L1">L1 (First Year)</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  disabled={!formData.major || !formData.academic_year}
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Specialty */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <label className="text-sm font-medium">
                Your Specialty (Optional)
              </label>
              <Input
                placeholder="Search specialty..."
                value={formData.spercialty}
                onChange={(e) => {
                  setFormData({ ...formData, spercialty: e.target.value });
                  fetchSuggestions("Spercialty", e.target.value, {
                    major: formData.major,
                    year: formData.academic_year,
                  });
                }}
              />
              <SuggestionList
                list={suggestions}
                onSelect={(val) => {
                  setFormData({ ...formData, spercialty: val });
                  setSuggestions([]);
                }}
              />

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  loading={loading}
                  onClick={handleFinish}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// مكون فرعي لعرض الاقتراحات
function SuggestionList({
  list,
  onSelect,
}: {
  list: string[];
  onSelect: (v: string) => void;
}) {
  if (list.length === 0) return null;
  return (
    <ul className="border rounded-md mt-1 bg-white dark:bg-gray-800 shadow-sm max-h-40 overflow-auto">
      {list.map((item, i) => (
        <li
          key={i}
          onClick={() => onSelect(item)}
          className="p-2 hover:bg-primary/10 cursor-pointer text-sm border-b last:border-0"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
