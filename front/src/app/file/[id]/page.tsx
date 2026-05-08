"use client";

import allActurStore from "@/Store/allActurStore";
import FilePreviewModal from "@/components/FilePreviewModal";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestFilePage() {
    const { id } = useParams();
    const showDetailFile = allActurStore((state) => state.showDetailFile);
    const [file, setFile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFile = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await showDetailFile(id as string);
                // showDetailFile returns response.data directly
                if (res && (res.id_file || res.data?.id_file)) {
                    setFile(res.data || res);
                } else {
                    setError(res?.message || "File not found");
                }
            } catch (err) {
                console.error("Error fetching file:", err);
                setError("Failed to load file details");
            } finally {
                setLoading(false);
            }
        };

        fetchFile();
    }, [id, showDetailFile]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading file details...</p>
            </div>
        );
    }

    if (error || !file) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
                <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Oops!</h1>
                <p className="text-slate-500 max-w-md">{error || "We couldn't find the file you're looking for."}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Guest Banner */}
            <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-medium">
                You are viewing this file as a guest. <a href="/signup" className="underline font-bold">Sign up</a> for full access.
            </div>
            
            <FilePreviewModal file={file} />
        </div>
    );
}