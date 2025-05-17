"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!", {
        position: "bottom-center",
        duration: 2000,
        style: {
          background: "#1e1e2e",
          color: "#e1e1e3",
          borderColor: "#313244",
        },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code", {
        position: "bottom-center",
        duration: 2000,
      });
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      type="button"
      className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {copied ? (
        <Check className="size-4 text-green-400" />
      ) : (
        <Copy className="size-4 text-gray-400 group-hover:text-gray-300" />
      )}
      {isHovering && !copied && (
        <div className="absolute top-full right-0 mt-2 bg-[#151520] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
          Copy code
        </div>
      )}
    </button>
  );
}

export default CopyButton;
