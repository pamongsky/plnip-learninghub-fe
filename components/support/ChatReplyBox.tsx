"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface ChatReplyBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileSelect?: (files: FileList) => void;
  onRemoveFile?: (index: number) => void;
  attachments?: File[];
  previewUrls?: string[];
  isSubmitting?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function ChatReplyBox({
  value,
  onChange,
  onSend,
  onFileSelect,
  onRemoveFile,
  attachments = [],
  previewUrls = [],
  isSubmitting = false,
  placeholder = "Tulis balasan...",
  label = "Balas",
  disabled = false,
}: ChatReplyBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSubmitting) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onFileSelect) {
      onFileSelect(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 left-0 right-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg"
    >
      {/* File Previews - Show above input if exists */}
      {previewUrls.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative group"
              >
                <div className="h-16 w-16 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                {onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(index)}
                    aria-label={`Remove attachment ${index + 1}`}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="px-3 py-2">
        <div
          className={`flex items-center gap-2 rounded-xl border transition-all ${
            isFocused
              ? "border-pln-primary dark:border-pln-light ring-1 ring-pln-primary/20"
              : "border-slate-200 dark:border-slate-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {/* File Attachment Button */}
          {onFileSelect && (
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={disabled || isSubmitting}
              aria-label="Attach file"
              className="flex-shrink-0 p-2 text-slate-400 hover:text-pln-primary transition-colors disabled:opacity-50"
            >
              <PaperClipIcon className="h-4 w-4" />
            </button>
          )}

          {/* Hidden File Input */}
          {onFileSelect && (
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent px-0 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed"
            style={{
              minHeight: "20px",
              maxHeight: "120px",
            }}
          />

          {/* Send Button */}
          <motion.button
            type="button"
            onClick={onSend}
            disabled={!value.trim() || isSubmitting || disabled}
            aria-label="Send message"
            whileHover={{ scale: value.trim() ? 1.05 : 1 }}
            whileTap={{ scale: value.trim() ? 0.95 : 1 }}
            className={`flex-shrink-0 m-1 p-2 rounded-lg transition-all ${
              value.trim() && !isSubmitting
                ? "bg-pln-primary hover:bg-pln-dark text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
