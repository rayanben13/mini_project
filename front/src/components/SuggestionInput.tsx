// components/SuggestionInput.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface SuggestionInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onFetch: (value: string) => void; // دالة جلب الاقتراحات
    suggestions: string[];
    isLoading?: boolean;
    error?: string;
    disabled?: boolean;
}

export default function SuggestionInput({
    label,
    placeholder,
    value,
    onChange,
    onFetch,
    suggestions,
    isLoading = false,
    error,
    disabled = false,
}: SuggestionInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // ✅ إخفاء القائمة عند الضغط خارجها
    const handleBlur = (e: React.FocusEvent) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setTimeout(() => setIsFocused(false), 150);
        }
    };

    const showDropdown = isFocused && (suggestions.length > 0 || isLoading);

    return (
        <div
            className="space-y-1.5 relative"
            ref={containerRef}
            onBlur={handleBlur}
        >
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label}
            </Label>

            {/* Input مع أيقونة التحميل */}
            <div className="relative">
                <Input
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        onFetch(e.target.value);
                    }}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`rounded-xl pr-9 border-slate-200 dark:border-slate-700 focus:border-[#0975e6] ${error ? "border-red-400" : ""
                        }`}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                )}
            </div>

            {/* ✅ Dropdown الاقتراحات */}
            {showDropdown && (
                <div className="absolute z-50 w-full top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                        </div>
                    ) : (
                        <ul className="max-h-48 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()} // منع blur قبل الاختيار
                                        onClick={() => {
                                            onChange(suggestion);
                                            setIsFocused(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-[#0975e6]/5 hover:text-[#0975e6] transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Error */}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}