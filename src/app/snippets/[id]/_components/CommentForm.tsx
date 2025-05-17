"use client";

import { CodeIcon, SendIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import CommentContent from "./CommentContent";

interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
  isSubmitting: boolean;
}

// Language suggestions for code blocks




interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CommentForm({ isSubmitting, onSubmit }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const { user } = useUser();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newComment = comment.substring(0, start) + "  " + comment.substring(end);
      setComment(newComment);
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
    } else if (e.key === "Enter" && e.shiftKey && !isSubmitting) {
      e.preventDefault();
      if (!comment.trim()) return;
      
      await onSubmit(comment);
      setComment("");
      setIsPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) return;

    await onSubmit(comment);

    setComment("");
    setIsPreview(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="bg-[#0a0a0f] rounded-xl border border-[#ffffff0a] overflow-hidden">
        {/* Comment form header with user avatar */}
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ffffff08] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt={user.fullName || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-[#808086]" />
              )}
            </div>
            <span className="text-sm text-gray-400">{user?.fullName}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              isPreview ? "bg-blue-500/10 text-blue-400" : "hover:bg-[#ffffff08] text-gray-400"
            }`}
          >
            {isPreview ? "Edit" : "Preview"}
          </button>
        </div>

        {/* Comment form body */}
        {isPreview ? (
          <div className="min-h-[120px] p-4 text-[#e1e1e3]">
            <CommentContent content={comment} />
          </div>
        ) : (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add to the discussion..."
            className="w-full bg-transparent border-0 text-[#e1e1e3] placeholder:text-[#808086] outline-none 
            resize-none min-h-[120px] p-4 font-mono text-sm"
          />
        )}

        {/* Comment Form Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 bg-[#080809] border-t border-[#ffffff0a]">
          <div className="text-xs text-[#808086] space-y-2">
            <div className="flex items-center gap-2">
              <CodeIcon className="w-3.5 h-3.5" />
              <span>Format code with triple backticks and language name</span>
            </div>
            <div>
              <span className="text-[#808086]/80 mr-2">Example:</span>
              <span className="font-mono bg-[#0a0a0f] px-1.5 py-0.5 rounded text-blue-400">
                ```js(Enter)console.log(hello)(Enter)```
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="bg-[#151520] px-1.5 py-0.5 rounded text-xs text-purple-400">js/javascript</span>
              <span className="bg-[#151520] px-1.5 py-0.5 rounded text-xs text-blue-400">ts/typescript</span>
              <span className="bg-[#151520] px-1.5 py-0.5 rounded text-xs text-green-400">py/python</span>
              <span className="bg-[#151520] px-1.5 py-0.5 rounded text-xs text-orange-400">java</span>
              <span className="bg-[#151520] px-1.5 py-0.5 rounded text-xs text-pink-400">css</span>
              <span className="bg-[#151520] px-1.5 py-0.5 rounded text-xs text-yellow-400">html</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:ml-auto"
          >
            {isSubmitting ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-white/30 
                border-t-white rounded-full animate-spin"
                />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4" />
                <span>Comment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default CommentForm;
