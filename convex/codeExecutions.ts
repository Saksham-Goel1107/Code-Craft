import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const saveExecution = mutation({
  args: {
    language: v.string(),
    code: v.string(),
    // we could have either one of them, or both at the same time
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    // check pro status
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user?.isPro && args.language !== "javascript") {
      throw new ConvexError("Pro subscription required to use this language");
    }

    await ctx.db.insert("codeExecutions", {
      ...args,
      userId: identity.subject,
    });
  },
});

export const getUserExecutions = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("codeExecutions")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
      // Validate user exists first
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .first();

      if (!user) {
        return {
          totalExecutions: 0,
          languagesCount: 0,
          languages: [],
          last24Hours: 0,
          favoriteLanguage: "N/A",
          languageStats: {},
          mostStarredLanguage: "N/A",
        };
      }

      const executions = await ctx.db
        .query("codeExecutions")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();

      // Get starred snippets
      const starredSnippets = await ctx.db
        .query("stars")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();

    // Get all starred snippet details to analyze languages
    const snippetIds = starredSnippets.map((star) => star.snippetId);
    const snippetDetails = await Promise.all(
      snippetIds.map(async (id) => {
        try {
          return await ctx.db.get(id);
        } catch (error) {
          console.error(`Error fetching snippet ${id}:`, error);
          return null;
        }
      })
    );

    // Calculate most starred language from valid snippets
    const validSnippetDetails = snippetDetails.filter((s): s is NonNullable<typeof s> => s !== null);
    const starredLanguages = validSnippetDetails.reduce(
      (acc, curr) => {
        if (curr.language) {
          acc[curr.language] = (acc[curr.language] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const mostStarredLanguage =
      Object.entries(starredLanguages).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "N/A";

    // Calculate execution stats for last 24 hours
    const now = Date.now();
    const last24Hours = executions.filter(
      (e) => e._creationTime > now - 24 * 60 * 60 * 1000
    ).length;

    // Calculate language stats from executions
    const languageStats = executions.reduce(
      (acc, curr) => {
        acc[curr.language] = (acc[curr.language] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const languages = Object.keys(languageStats);
    const favoriteLanguage = languages.length
      ? languages.reduce((a, b) => (languageStats[a] > languageStats[b] ? a : b))
      : "N/A";

    const stats = {
      totalExecutions: executions.length,
      languagesCount: languages.length,
      languages: languages,
      last24Hours,
      favoriteLanguage,
      languageStats,
      mostStarredLanguage,
    };

    return stats;
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        totalExecutions: 0,
        languagesCount: 0,
        languages: [],
        last24Hours: 0,
        favoriteLanguage: "N/A",
        languageStats: {},
        mostStarredLanguage: "N/A",
      };
    }
  },
});
