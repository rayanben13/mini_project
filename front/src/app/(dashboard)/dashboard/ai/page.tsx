"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useAiStore from "@/Store/ai/aiStore";
import useFilesStore from "@/Store/user/filesStore";
import { Bot, Paperclip, Send, User, X, Loader2, FolderOpen } from "lucide-react";

function AiAssistantContent() {
  const {
    messages,
    loading,
    activeDocument,
    activationLoading,
    sendAiWithFile,
    sendAiWithId,
    clearMessages,
    activateLibraryDocument,
    activateLocalDocument,
    clearActiveDocument,
  } = useAiStore();
  const { showMyFiles, loading: filesLoading } = useFilesStore();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Library Modal State
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState<any[]>([]);

  // URL params
  const searchParams = useSearchParams();
  const fileIdParam = searchParams.get("fileId");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (fileIdParam) {
      const currentActiveId = activeDocument?.type === 'library' ? activeDocument.id : null;
      if (Number(fileIdParam) !== Number(currentActiveId)) {
        activateLibraryDocument(Number(fileIdParam), "Document from Library");
      }
    }
  }, [fileIdParam]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      scrollToBottom();
    }
  }, [messages, loading, mounted]);

  useEffect(() => {
    if (isLibraryModalOpen && libraryFiles.length === 0) {
      // Fetch files when modal opens
      showMyFiles().then(res => {
        if (res?.files) {
          // Filter to only allow PDFs if that's what the backend supports
          setLibraryFiles(res.files.filter((f: any) => f.file_path?.endsWith('.pdf') || true));
        }
      });
    }
  }, [isLibraryModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeDocument) return;

    const messageToSend = input;
    setInput("");
    setError(null);

    try {
      if (activeDocument.type === "library") {
        await sendAiWithId(messageToSend, activeDocument.id, "en");
      } else {
        await sendAiWithFile(messageToSend, null, "en");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validation: Check if it's a PDF
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are supported");
        e.target.value = ''; // Reset input
        return;
      }
      
      // Validation: Check file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        setError("File size exceeds 5MB limit");
        e.target.value = ''; // Reset input
        return;
      }
      
      try {
        await activateLocalDocument(selectedFile);
      } catch (err) {
        console.error(err);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Assistant</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ask questions about your documents</p>
          </div>
        </div>
        <button
          onClick={() => {
            clearActiveDocument();
            clearMessages();
          }}
          className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
        {!mounted ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/5 dark:bg-blue-500/5 flex items-center justify-center">
              <Bot className="w-10 h-10 text-primary/40 dark:text-blue-400/40" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">How can I help you today?</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed px-4">
                Please upload a document or select one from your library first. I'll read through it and help you find the answers.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg: any, idx: number) => (
            <div key={idx} className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                  : 'bg-primary text-white'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-3 sm:gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white">
              <Bot size={16} />
            </div>
            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {error && (
          <div className="mb-3 flex items-center justify-between bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg border border-red-200 dark:border-red-500/20">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="hover:text-red-800 dark:hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {activeDocument && (
          <div className="mb-3 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 w-fit px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Paperclip className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
              {activeDocument.type === "local" ? activeDocument.name : activeDocument.title}
            </span>
            <button 
              type="button"
              onClick={clearActiveDocument}
              className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="relative flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex items-center pl-2">
            
            <button
              type="button"
              onClick={() => setIsLibraryModalOpen(true)}
              className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Select from My Library"
              disabled={activationLoading}
            >
              <FolderOpen className="w-5 h-5" />
            </button>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf"
              disabled={activationLoading}
            />
            <label 
              htmlFor="file-upload"
              className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Upload PDF File"
            >
              {activationLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </label>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={!activeDocument ? "Please select a file first..." : "Ask me anything about your document..."}
              className="flex-1 bg-transparent border-none py-4 px-3 text-sm font-medium focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              disabled={loading || !activeDocument || activationLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || loading || !activeDocument || activationLoading}
            className="h-[52px] px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span className="hidden sm:inline">{loading ? "Sending..." : "Send"}</span>
          </button>
        </form>
      </div>

      {/* Library Selection Modal */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Select from Library</h3>
              <button 
                onClick={() => setIsLibraryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {filesLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                </div>
              ) : libraryFiles.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No compatible files found in your library.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {libraryFiles.map((fileItem) => (
                    <button
                      key={fileItem.id_file}
                      onClick={() => {
                        activateLibraryDocument(fileItem.id_file, fileItem.title || fileItem.file_path?.split('/').pop());
                        setIsLibraryModalOpen(false);
                      }}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{fileItem.title || fileItem.file_path?.split('/').pop()}</p>
                        <p className="text-xs text-slate-400 truncate">{fileItem.file_path}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiAssistantPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    }>
      <AiAssistantContent />
    </Suspense>
  );
}
