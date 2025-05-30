import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { Copy, Link2, MessageSquare, Share2, X } from "lucide-react";
import toast from "react-hot-toast";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";

function ShareSnippetDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const { language, getCode } = useCodeEditorStore();
  const createSnippet = useMutation(api.snippets.createSnippet);
  const syncUser = useMutation(api.users.syncUser);
  const [lastShareAttempt, setLastShareAttempt] = useState(0);
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      syncUser({
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
      });
    }
  }, [isLoaded, user, syncUser]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      toast.error("Please wait while we check your authentication status");
      return;
    }

    if (!isSignedIn) {
      toast.error("Please sign in to share snippets");
      return;
    }

    // Rate limiting: Allow sharing once per second
    const now = Date.now();
    if (now - lastShareAttempt < 1000) {
      toast.error('Please wait before sharing again');
      return;
    }
    setLastShareAttempt(now);
    
    if (!title.trim()) {
      toast.error('Please enter a title for your snippet');
      return;
    }

    if (!getCode().trim()) {
      toast.error('Cannot share an empty snippet');
      return;
    }

    setIsSharing(true);

    try {
      const code = getCode();
      if (!code) {
        throw new Error('No code to share');
      }
      console.log('Starting snippet creation with:', { title, language, codeLength: code.length });
      
      const snippet = await createSnippet({ title, language, code });
      if (!snippet) {
        throw new Error('Failed to create snippet');
      }
      console.log('Snippet created with ID:', snippet);
      
      const url = `${window.location.origin}/snippets/${snippet}`;
      setShareUrl(url);
      toast.success("Snippet shared successfully");
    } catch (error) {
      console.error("Error creating snippet:", error);
      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('Not authenticated')) {
          toast.error('Please sign in to share snippets');
        } else if (error.message.includes('User profile not found')) {
          toast.error('Please complete your profile setup before sharing');
        } else {
          toast.error(`Failed to share: ${error.message}`);
        }
      } else {
        toast.error("Failed to share snippet. Please try again later.");
      }
      setShareUrl("");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!', { 
        icon: '📋',
        duration: 2000 
      });
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Copy error:', error);
    }
  };

  const handleCopyRichText = async () => {
    if (!shareUrl) return;

    try {
      const logoUrl = `${window.location.origin}/code-craft.png`;
      const richText = `Code Craft Snippet Share\n\nTitle: ${title}\nLanguage: ${language}\n\nI've created a code snippet with Code Craft that I'd like to share with you.\n\nView it here: ${shareUrl}\n\nCode Craft - The Professional Code Compiler\n${window.location.origin}\n\nLogo: ${logoUrl}`;
      
      await navigator.clipboard.writeText(richText);
      toast.success('Rich message copied with logo URL!', { 
        icon: '📋',
        duration: 2000 
      });
    } catch (error) {
      toast.error('Failed to copy rich message');
      console.error('Copy error:', error);
    }
  };

  const handleMessageShare = () => {
    if (!shareUrl) return;
    

    const shareMessage = `Check out my Code Craft snippet: ${title}\n\n${shareUrl}`;
    const messageUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.open(messageUrl, '_blank');
  };

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;


    const shareMessage = `*Code Craft Snippet*\n\n*Title:* ${title}\n*Language:* ${language}\n\nI've created a code snippet with Code Craft.\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  // If not signed in, show sign-in prompt
  if (isLoaded && !isSignedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#1e1e2e] rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Sign In Required</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 mb-6">Please sign in to share code snippets with the community.</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e2e] rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Share Snippet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter snippet title"
              required
            />
          </div>

          {shareUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#181825] p-3 rounded-lg">
                <Link2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm border-none focus:outline-none truncate"
                />
              </div>
              
              {/* Share preview with logo */}
              <div className="bg-[#181825] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative w-8 h-8 overflow-hidden rounded-md">
                    <Image 
                      src="/code-craft.png" 
                      alt="Code Craft Logo" 
                      width={32} 
                      height={32} 
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-white">Code Craft Snippet Share</h3>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div><span className="font-medium text-gray-300">Title:</span> {title}</div>
                  <div><span className="font-medium text-gray-300">Language:</span> {language}</div>
                  <div className="mt-2 text-gray-400">I&apos;ve created a code snippet with Code Craft that I&apos;d like to share with you.</div>
                  <div className="mt-2">
                    <a href={shareUrl} className="text-blue-400 underline break-all" target="_blank" rel="noopener noreferrer">
                      {shareUrl}
                    </a>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Note: When sharing, links will be clickable in WhatsApp and Messages.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-400 
                  hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={handleCopyRichText}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-400 
                  hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy with Logo
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-400 
                  hover:bg-green-500/20 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleMessageShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-400 
                  hover:bg-purple-500/20 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </button>
              </div>
            </div>
          )}

          {!shareUrl && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSharing || !isLoaded}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSharing ? (
                  <div className="size-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : null}
                {isSharing ? "Creating..." : "Create & Share"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ShareSnippetDialog;
