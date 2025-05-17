import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const signature = request.headers.get("Stripe-Signature");

    console.log("Received Stripe webhook request");

    if (!signature) {
      console.error("Missing Stripe-Signature header");
      return new Response("Missing Stripe-Signature header", { status: 400 });
    }

    try {
      const event = await ctx.runAction(internal.stripe.verifyWebhook, {
        payload: payloadString,
        signature,
      });

      console.log("Verified webhook event:", {
        type: event.type,
        id: event.id,
        object: event.object
      });

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Validate required fields and log full session data for debugging
        console.log("Full checkout session data:", session);

        if (!session.customer_email || !session.customer || !session.client_reference_id) {
          console.error("Missing required fields in session:", {
            hasEmail: !!session.customer_email,
            hasCustomer: !!session.customer,
            hasClientRef: !!session.client_reference_id
          });
          throw new Error("Missing required fields in checkout session");
        }

        console.log("Processing checkout session:", {
          customer_email: session.customer_email,
          customer: session.customer,
          client_reference_id: session.client_reference_id,
          mode: session.mode,
          payment_status: session.payment_status,
        });

        const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        console.log("Processing successful checkout:", {
          email: session.customer_email,
          customerId,
          subscriptionId,
          clientReferenceId: session.client_reference_id
        });

        // Only process if payment was successful
        if (session.payment_status === 'paid') {
          try {
            // First, check if we've already processed this session ID
            const existingPayment = await ctx.runQuery(api.users.getProcessedPayment, {
              sessionId: session.id
            });
            
            if (existingPayment) {
              console.log("Payment session already processed in webhook:", session.id);
              return new Response("Webhook already processed", { status: 200 });
            }
            
            console.log(`Upgrading user ${session.client_reference_id} to pro via webhook`);
            const { success } = await ctx.runMutation(api.users.upgradeToPro, {
              userId: session.client_reference_id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId || "",
              amount: session.amount_total ? session.amount_total / 100 : 0,
            });

            if (success) {
              // Record this session as processed
              await ctx.runMutation(api.users.recordProcessedPayment, {
                sessionId: session.id,
                userId: session.client_reference_id,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                status: 'success'
              });
              
              console.log("Successfully upgraded user to pro for user:", session.client_reference_id);
            } else {
              console.error("Failed to upgrade user to pro:", session.client_reference_id);
              
              // Record the failed attempt
              await ctx.runMutation(api.users.recordProcessedPayment, {
                sessionId: session.id,
                userId: session.client_reference_id,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                status: 'error'
              });
              
              throw new Error("Failed to upgrade user to pro");
            }
          } catch (error) {
            console.error("Error upgrading user to pro:", error);
            throw error;
          }
        } else {
          console.error("Payment not marked as paid:", session.payment_status);
          throw new Error("Payment not marked as paid");
        }
      }

      return new Response("Webhook processed successfully", { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }),
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created" || eventType === "user.updated") {
      // save the user to convex db
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          userId: id,
          email,
          name,
          imageUrl: image_url || undefined,
        });
      } catch (error) {
        console.log("Error syncing user:", error);
        return new Response("Error syncing user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
