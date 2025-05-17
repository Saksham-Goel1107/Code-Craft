"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import SnippetLoadingSkeleton from "./_components/SnippetLoadingSkeleton";
import NavigationHeader from "@/components/NavigationHeader";
import { Clock, Code, MessageSquare, Share2, User, ArrowLeft } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import toast from "react-hot-toast";
import CopyButton from "./_components/CopyButton";
import Comments from "./_components/Comments";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

function SnippetDetailPage() {
  const snippetId = useParams().id;
  const { isLoaded, isSignedIn } = useAuth();
  const [isSharing, setIsSharing] = useState(false);

  const snippet = useQuery(api.snippets.getSnippetById, { snippetId: snippetId as Id<"snippets"> });
  const comments = useQuery(api.snippets.getComments, { snippetId: snippetId as Id<"snippets"> });

  // Show loading skeleton while auth is loading or snippet data is loading
  if (!isLoaded || snippet === undefined || snippet === null) {
    return <SnippetLoadingSkeleton />;
  }

  // Handle case when snippet is not found
  if (!snippet) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <NavigationHeader />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Snippet not found</h1>
          <p className="text-gray-400 mb-8">The snippet you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link href="/snippets" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 
            hover:bg-blue-500/20 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to snippets
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const url = `${window.location.origin}/snippets/${snippetId}`;
    const shareText = `Check out this code snippet: ${snippet.title}\n\n${url}`;
    
    try {
      // Try using Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: snippet.title,
          text: shareText,
          url: url,
        });
        return;
      }

      // Fall back to clipboard API
      await navigator.clipboard.writeText(shareText);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      // Handle user cancellation gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      // If all else fails, try fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to share snippet. Please try again later.');
        console.error('Share error:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl bg-[#ffffff08] p-2.5">
                <Image
                  src={`/${snippet.language}.png`}
                  alt={`${snippet.language} logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                  {snippet.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[#8b8b8d]">
                    {snippet.userImageUrl ? (
                      <Image 
                        src={snippet.userImageUrl} 
                        alt={snippet.userName || "User"}
                        width={20}
                        height={20}
                        className="size-5 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>{snippet.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b8b8d]">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(snippet._creationTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b8b8d]">
                    <MessageSquare className="w-4 h-4" />
                    <span>{comments?.length} comments</span>
                  </div>
                </div>
              </div>
            </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center px-3 py-1.5 bg-[#ffffff08] text-[#808086] rounded-lg text-sm font-medium">
                  {snippet.language}
                </div>
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 
                  rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? (
                    <div className="size-4 border-2 border-t-transparent border-green-400 rounded-full animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  Share Snippet
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="mb-8 rounded-2xl overflow-hidden border border-[#ffffff0a] bg-[#121218]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#ffffff0a]">
              <div className="flex items-center gap-2 text-[#808086]">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Source Code</span>
              </div>
              <CopyButton code={snippet.code} />
            </div>
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[snippet.language].monacoLanguage}
              value={snippet.code}
              theme="vs-dark"
              beforeMount={defineMonacoThemes}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                readOnly: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
              }}
            />
          </div>

          {/* Comments Section with Auth Check */}
          <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl p-6 sm:p-8">
            {isSignedIn ? (
              <Comments snippetId={snippet._id} />
            ) : (
              <div className="text-center py-8">
                <h3 className="text-xl font-medium text-gray-300 mb-4">Sign in to comment</h3>
                <p className="text-gray-500 mb-6">Join the discussion by signing in to your account</p>
                {/* Wrap SignInButton in a client-side only check using useState/useEffect */}
                {useState !== undefined && (
                  <SignInButton mode="modal">
                    <button className="px-6 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 
                    rounded-lg transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SnippetDetailPage;
