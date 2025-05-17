import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // clerkId
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    amount: v.optional(v.number()),
    lastPayment: v.optional(v.number()),
  }).index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(), // store user's name for easy access
    userImageUrl: v.optional(v.string()), // store user's image URL
    createdAt: v.number(), // timestamp
  }).index("by_user_id", ["userId"]),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.optional(v.string()), // store user's image URL
    content: v.string(), // This will store HTML content
  }).index("by_snippet_id", ["snippetId"]),

  stars: defineTable({
    userId: v.string(),
    snippetId: v.id("snippets"),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_snippet_id", ["snippetId"])
    .index("by_user_id_and_snippet_id", ["userId", "snippetId"]),
    
  processedPayments: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    processedAt: v.number(),
    status: v.string(),
    amount: v.number(),
  }).index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"]),
});
