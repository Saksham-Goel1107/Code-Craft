import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import Stripe from "stripe";

// Create Stripe instance
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" })
  : null;

export const syncUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", {
        userId: args.userId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        isPro: false,
      });
    } else {
      // Update existing user if details have changed
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
    }
  },
});

export const getUser = query({
  args: { userId: v.string() },

  handler: async (ctx, args) => {
    if (!args.userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!user) return null;

    return user;
  },
});

export const upgradeToPro = mutation({
  args: {
    userId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("Upgrading user to pro:", args);

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    console.log("Found user:", user);

    if (!user) {
      console.error("User not found for upgrade:", args);
      throw new Error("User not found");
    }

    try {
      await ctx.db.patch(user._id, {
        isPro: true,
        proSince: Date.now(),
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        amount: args.amount,
        lastPayment: Date.now()
      });

      console.log("Successfully updated user in database:", user._id);
      return { success: true };
    } catch (error) {
      console.error("Failed to update user in database:", error);
      throw new Error("Failed to update user status");
    }
  },
});

export const forceUpgradeToPro = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      isPro: true,
      proSince: Date.now(),
      lastPayment: Date.now(),
      amount: 1000, // $10.00
    });

    return { success: true, message: "User upgraded to pro successfully" };
  },
});

export const verifyAndUpgradeFromSessionId = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Starting verifyAndUpgradeFromSessionId with:", args);
    
    if (!stripe) {
      console.error("Stripe is not configured - missing API key");
      throw new Error("Stripe is not configured");
    }

    try {
      // Fetch the session from Stripe
      console.log("Fetching session from Stripe:", args.sessionId);
      const session = await stripe.checkout.sessions.retrieve(args.sessionId);
      console.log("Session retrieved:", {
        id: session.id,
        paymentStatus: session.payment_status,
        clientId: session.client_reference_id,
        amountTotal: session.amount_total
      });
      
      // Verify that this session belongs to the user
      if (session.client_reference_id !== args.userId) {
        throw new Error("Session does not belong to this user");
      }
      
      // Check if payment was successful
      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }
      
      // Check if user exists
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .first();
      
      if (!user) {
        console.error("User not found in database:", args.userId);
        throw new Error("User not found");
      }
      
      console.log("Found user:", { 
        id: user._id, 
        userId: user.userId, 
        isPro: user.isPro 
      });
      
      // Check if user is already pro
      if (user.isPro) {
        console.log("User is already Pro:", user.userId);
        return { success: true, alreadyPro: true };
      }
      
      // Update user to pro
      const customerId = typeof session.customer === "string" 
        ? session.customer 
        : session.customer?.id || "";
        
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || "";
      
      console.log("Updating user to Pro with:", {
        userId: user.userId,
        customerId,
        subscriptionId,
        amount: session.amount_total ? session.amount_total / 100 : 0
      });
        
      try {
        await ctx.db.patch(user._id, {
          isPro: true,
          proSince: Date.now(),
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          lastPayment: Date.now()
        });
        
        console.log("Successfully updated user to Pro:", user.userId);
        return { success: true };
      } catch (patchError) {
        console.error("Database patch error:", patchError);
        throw new Error("Failed to update user to Pro status");
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to verify payment session");
    }
  },
});

export const verifyAndUpgradeFromAction = action({
  args: {
    userId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; alreadyProcessed?: boolean; alreadyPro?: boolean; status?: string }> => {
    console.log("Starting payment verification action with:", args);
    
    if (!stripe) {
      console.error("Stripe is not configured - missing API key");
      throw new Error("Stripe is not configured");
    }
    
    // Check if this payment session has already been processed
    const existingPayment = await ctx.runQuery(api.users.getProcessedPayment, {
      sessionId: args.sessionId
    });
    
    if (existingPayment) {
      console.log(`Payment session ${args.sessionId} was already processed at ${new Date(existingPayment.processedAt).toISOString()}`);
      return { 
        success: true, 
        alreadyProcessed: true,
        status: existingPayment.status
      };
    }
    
    // Since we confirmed the payment hasn't been processed yet, try processing it now
    try {
      // Fetch the session from Stripe
      console.log("Fetching session from Stripe:", args.sessionId);
      const session = await stripe.checkout.sessions.retrieve(args.sessionId);
      console.log("Session retrieved:", {
        id: session.id,
        paymentStatus: session.payment_status,
        clientId: session.client_reference_id,
        amountTotal: session.amount_total
      });
      
      // Verify that this session belongs to the user
      if (session.client_reference_id !== args.userId) {
        throw new Error("Session does not belong to this user");
      }
      
      // Check if payment was successful
      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }
      
      // Get the user from the database
      const user = await ctx.runQuery(api.users.getUser, { userId: args.userId });
      
      if (!user) {
        console.error("User not found in database:", args.userId);
        throw new Error("User not found");
      }
      
      console.log("Found user:", { 
        userId: user.userId, 
        isPro: user.isPro 
      });
      
      // Check if user is already pro
      if (user.isPro) {
        console.log("User is already Pro:", user.userId);
        return { success: true, alreadyPro: true };
      }
      
      // Update user to pro
      const customerId = typeof session.customer === "string" 
        ? session.customer 
        : session.customer?.id || "";
        
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || "";
      
      console.log("Upgrading user to Pro with:", {
        userId: user.userId,
        customerId,
        subscriptionId,
        amount: session.amount_total ? session.amount_total / 100 : 0
      });
      
      try {
        const result = await ctx.runMutation(api.users.upgradeToPro, {
          userId: args.userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId || "",
          amount: session.amount_total ? session.amount_total / 100 : 0,
        });
        
        // Record this payment as successfully processed
        await ctx.runMutation(api.users.recordProcessedPayment, {
          sessionId: args.sessionId,
          userId: args.userId,
          status: 'success',
          amount: session.amount_total ? session.amount_total / 100 : 0
        });
        
        console.log("Successfully upgraded user to Pro:", user.userId, result);
        return { success: true };
      } catch (patchError) {
        console.error("Database update error:", patchError);
        
        // Record the failed payment processing attempt
        await ctx.runMutation(api.users.recordProcessedPayment, {
          sessionId: args.sessionId,
          userId: args.userId,
          status: 'error',
          amount: session.amount_total ? session.amount_total / 100 : 0
        });
        
        throw new Error("Failed to update user to Pro status");
      }
    } catch (error) {
      console.error("Error in payment verification action:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to verify payment session");
    }
  },
});

export const getProcessedPayment = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("processedPayments")
      .withIndex("by_session_id")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();
  },
});

export const recordProcessedPayment = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    status: v.string(), // "pending", "success", "error"
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if this payment has already been processed
    const existingPayment = await ctx.db
      .query("processedPayments")
      .withIndex("by_session_id")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();
    
    if (existingPayment) {
      console.log(`Payment ${args.sessionId} was already processed with status: ${existingPayment.status}`);
      return { 
        success: true, 
        alreadyProcessed: true,
        status: existingPayment.status,
        id: existingPayment._id
      };
    }
    
    // Record this payment processing attempt
    const id = await ctx.db.insert("processedPayments", {
      sessionId: args.sessionId,
      userId: args.userId,
      processedAt: Date.now(),
      status: args.status,
      amount: args.amount || 0
    });
    
    return { 
      success: true, 
      alreadyProcessed: false,
      id
    };
  },
});
