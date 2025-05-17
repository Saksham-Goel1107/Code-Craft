import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});

export const verifyWebhook = internalAction({
  args: { payload: v.string(), signature: v.string() },
  handler: async (_, args) => {
    const event = stripe.webhooks.constructEvent(
      args.payload,
      args.signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  },
});

interface CheckoutSession {
  url: string | null;
}

export const createCheckoutSession = action({
  args: { userId: v.string(), userEmail: v.string() },
  handler: async (ctx, args): Promise<CheckoutSession> => {
    try {
      // Check for required environment variables
      if (!process.env.STRIPE_PRICE_ID) {
        console.error("STRIPE_PRICE_ID is not set");
        throw new Error("STRIPE_PRICE_ID environment variable is not set");
      }
      if (!process.env.NEXT_PUBLIC_APP_URL) {
        console.error("NEXT_PUBLIC_APP_URL is not set");
        throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set");
      }

      // Create checkout session with detailed error logging
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"], // This line can be removed if using automatic_payment_methods
          customer_email: args.userEmail,
          client_reference_id: args.userId,
          mode: "payment",
          billing_address_collection: "required",
          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID,
              quantity: 1,
            },
          ],
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
          metadata: {
            userId: args.userId,
          },
          allow_promotion_codes: true,
          automatic_tax: { enabled: true }
        });

        return { url: session.url };      } catch (stripeError) {
        if (stripeError instanceof Stripe.errors.StripeError) {
          console.error("Stripe Error Details:", {
            type: stripeError.type,
            code: stripeError.code,
            message: stripeError.message,
            param: stripeError.param
          });
        }
        throw stripeError;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create checkout session");
    }
  },
});

// Note: We can remove this since we're creating the checkout session directly in the mutation
