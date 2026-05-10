"use client";

import { useEffect, useRef, useState } from "react";
import useAiStore from "@/Store/ai/aiStore";
import { Bot, Paperclip, Send, User, X, Loader2, PanelRightClose } from "lucide-react";

export default function AiWindow() {
  const { messages, loading, isAiWindowOpen, activeFileId, closeAiWindow, sendAiWithFile, sendAiWithId, clearMessages } = useAiStore();
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Document State
  const [selectedLibraryFile, setSelectedLibraryFile] = useState<any | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeFileId) {
      setSelectedLibraryFile({ id_file: activeFileId, title: "Document from Library" });
    }
  }, [activeFileId]);

  useEffect(() => {
    if (isAiWindowOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isAiWindowOpen]);

  if (!isAiWindowOpen) {
    return (
      <button
        onClick={() => useAiStore.getState().openAiWindow()}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 p-4 bg-primary text-white rounded-full shadow-xl hover:bg-primary/90 hover:scale-105 transition-all z-40 flex items-center justify-center group"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file && !selectedLibraryFile && !localFileName) return;

    const messageToSend = input;
    const fileToSend = file;
    const libraryFileId = selectedLibraryFile?.id_file;

    setInput("");
    setFile(null); // Clear the actual File object so we don't re-upload
    setError(null);

    try {
      if (libraryFileId) {
        await sendAiWithId(messageToSend, libraryFileId, "en");
      } else {
        await sendAiWithFile(messageToSend, fileToSend || new File([], "empty.pdf", { type: "application/pdf" }), "en");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are supported");
        e.target.value = '';
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError("File size exceeds 5MB limit");
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setLocalFileName(selectedFile.name);
      setSelectedLibraryFile(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
        onClick={closeAiWindow}
      >
        {/* Centered Dialog */}
        <div 
          className="relative w-full max-w-2xl h-[85vh] z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()} // Prevent clicking inside dialog from closing it
        >
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  clearMessages();
                  setFile(null);
                  setLocalFileName(null);
                  setSelectedLibraryFile(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Clear
              </button>
              <button
                onClick={closeAiWindow}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center">
                  <Bot className="w-12 h-12 text-primary dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome to AI Assistant</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-[320px] mx-auto leading-relaxed">
                    To start a new conversation, please upload a document or select one from your library first.
                  </p>
                </div>

                {!(localFileName || selectedLibraryFile) ? (
                  <div className="flex items-center gap-4 mt-4">
                    <label 
                      htmlFor="window-file-upload-center"
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors cursor-pointer font-medium shadow-sm hover:shadow"
                    >
                      <Paperclip className="w-5 h-5" />
                      Upload PDF
                    </label>
                    <input
                      type="file"
                      id="window-file-upload-center"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400 animate-in fade-in zoom-in-95">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">File Selected Successfully</p>
                      <p className="text-xs opacity-80 truncate max-w-[200px]">
                        {localFileName || selectedLibraryFile?.title}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg: any, idx: number) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                      : 'bg-primary text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
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
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white">
                  <Bot size={16} />
                </div>
                <div className="rounded-2xl px-4 py-3 shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex items-center gap-3">
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
            
            {(localFileName || selectedLibraryFile) && (
              <div className="mb-3 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 w-fit px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Paperclip className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {localFileName ? localFileName : selectedLibraryFile?.title}
                </span>
                <button 
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setLocalFileName(null);
                    setSelectedLibraryFile(null);
                  }}
                  className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="relative flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex items-center pl-2">
                <input
                  type="file"
                  id="window-file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
                <label 
                  htmlFor="window-file-upload"
                  className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Upload PDF File"
                >
                  <Paperclip className="w-5 h-5" />
                </label>
                
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={messages.length === 0 && !localFileName && !selectedLibraryFile ? "Please select a file first..." : "Ask me anything..."}
                  className="flex-1 min-w-0 bg-transparent border-none py-3 px-2 text-sm font-medium focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
                  disabled={loading || (messages.length === 0 && !localFileName && !selectedLibraryFile)}
                />
              </div>
              
              <button
                type="submit"
                disabled={(!input.trim() && !file && !selectedLibraryFile && !localFileName) || loading || (messages.length === 0 && !localFileName && !selectedLibraryFile)}
                className="h-[46px] w-[46px] flex items-center justify-center shrink-0 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
