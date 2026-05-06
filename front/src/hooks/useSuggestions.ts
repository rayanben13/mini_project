// hooks/useSuggestions.ts
"use client";

import useAuthStore from "@/Store/AuthStore";
import { useCallback, useRef, useState } from "react";

type Mode = "univ" | "major" | "specialty" | "subject";

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  const { searchMoreInformation } = useAuthStore();
  const searchCache = useRef<Record<string, string[]>>({});
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(
    async (mode: Mode, name: string, extra = {}) => {
      if (name.length < 1) {
        setSuggestions([]);
        return;
      }

      const cacheKey = `${mode}-${name}-${JSON.stringify(extra)}`;

      // ✅ استخدام الكاش إذا كانت البيانات موجودة
      if (searchCache.current[cacheKey]) {
        setSuggestions(searchCache.current[cacheKey]);
        return;
      }

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        setIsSuggestionsLoading(true);
        try {
          const result = await searchMoreInformation({ mode, name, ...extra });

          if (result.success) {
            const results =
              result.data.universities ||
              result.data.majors ||
              result.data.specialties ||
              result.data.specialty ||
              result.data.specializations ||
              result.data.specialization ||
              result.data.subjects ||
              [];
            searchCache.current[cacheKey] = results;
            setSuggestions(results);
          }
        } finally {
          setIsSuggestionsLoading(false);
        }
      }, 400);
    },
    [searchMoreInformation],
  );

  // ✅ مسح الاقتراحات
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // ✅ مسح الكاش كامل (عند تغيير خطوة مثلاً)
  const clearCache = useCallback(() => {
    searchCache.current = {};
  }, []);

  return {
    suggestions,
    isSuggestionsLoading,
    fetchSuggestions,
    clearSuggestions,
    clearCache,
  };
}