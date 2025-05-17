"use client";
import { SignInButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";

function LoginButton() {
  // Add client-side only rendering to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder with similar dimensions
    return (
      <div className="px-4 py-2 rounded-lg bg-gray-800 animate-pulse h-9 w-24"></div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg
             transition-all duration-200 font-medium shadow-lg shadow-blue-500/20"
      >
        <LogIn className="w-4 h-4 transition-transform" />
        <span>Sign In</span>
      </button>
    </SignInButton>
  );
}
export default LoginButton;
