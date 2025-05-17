import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { UserIdentity } from "convex/server";

// Helper function to validate user identity
function validateUserIdentity(identity: UserIdentity): string {
  const userId = identity.subject;
  if (!userId) {
    throw new Error("Invalid user identity");
  }
  return userId;
}

export const createSnippet = mutation({
  args: {
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('Starting createSnippet mutation');
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Please sign in to share snippets");
    }

    const userId = validateUserIdentity(identity);

    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (!user) {
        await ctx.db.insert("users", {
          userId: userId,
          email: identity.email || "",
          name: identity.name || "Anonymous",
          imageUrl: identity.pictureUrl,
          isPro: false,
        });
      }

      // Validate input
      if (!args.title.trim()) {
        throw new Error("Title is required");
      }
      if (!args.code.trim()) {
        throw new Error("Code snippet cannot be empty");
      }

      const snippetId = await ctx.db.insert("snippets", {
        userId,
        userName: user?.name ?? identity.name ?? "Anonymous",
        userImageUrl: user?.imageUrl ?? identity.pictureUrl,
        title: args.title,
        language: args.language,
        code: args.code,
        createdAt: Date.now(),
      });
      console.log('Snippet created with ID:', snippetId);

      return snippetId;
    } catch (err) {
      console.error('Error creating snippet:', err);
      throw err; // Re-throw the error so the client knows something went wrong
    }
  },
});

export const deleteSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = validateUserIdentity(identity);

    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) throw new Error("Snippet not found");

    if (snippet.userId !== userId) {
      throw new Error("Not authorized to delete this snippet");
    }

    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    for (const star of stars) {
      await ctx.db.delete(star._id);
    }

    await ctx.db.delete(args.snippetId);
  },
});

export const starSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = validateUserIdentity(identity);

    const existing = await ctx.db
      .query("stars")
      .withIndex("by_user_id_and_snippet_id")
      .filter(
        (q) =>
          q.eq(q.field("userId"), userId) && q.eq(q.field("snippetId"), args.snippetId)
      )
      .first();

    if (existing) {
      // Only allow deleting if it's the user's own star
      if (existing.userId === userId) {
        await ctx.db.delete(existing._id);
      }
    } else {
      // User is adding a new star
      await ctx.db.insert("stars", {
        userId,
        snippetId: args.snippetId,
        createdAt: Date.now(),
      });
    }
  },
});

export const addComment = mutation({
  args: {
    snippetId: v.id("snippets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = validateUserIdentity(identity);

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // If user doesn't exist, create one
    let userName;
    let userImageUrl;
    
    if (!user) {
      userName = identity.name || "Anonymous";
      userImageUrl = identity.pictureUrl;
    } else {
      userName = user.name;
      userImageUrl = user.imageUrl || identity.pictureUrl;
    }

    return await ctx.db.insert("snippetComments", {
      snippetId: args.snippetId,
      userId,
      userName,
      userImageUrl,
      content: args.content,
    });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("snippetComments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = validateUserIdentity(identity);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== userId) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
  },
});

export const getSnippets = query({
  handler: async (ctx) => {
    try {
      const snippets = await ctx.db.query("snippets").order("desc").collect();
      return snippets;
    } catch (error) {
      console.error("Error fetching snippets:", error);
      return [];
    }
  },
});

export const getSnippetById = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.snippetId);
    return snippet;
  },
});

export const getComments = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .order("desc")
      .collect();

    return comments;
  },
});

export const isSnippetStarred = query({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const userId = validateUserIdentity(identity);
    
    // Only check for stars by the current user
    const star = await ctx.db
      .query("stars")
      .withIndex("by_user_id_and_snippet_id")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("snippetId"), args.snippetId)
        )
      )
      .first();

    return !!star;
  },
});

export const getSnippetStarCount = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    return stars.length;
  },
});

export const getStarredSnippets = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = validateUserIdentity(identity);

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const snippets = await Promise.all(stars.map((star) => ctx.db.get(star.snippetId)));

    return snippets.filter((snippet) => snippet !== null);
  },
});
