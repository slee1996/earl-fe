"use server";
import stripe from "@/utils/stripe";

export const cancelSubscription = async (subId) => {
  const subscriptions = await stripe.subscriptions.update(subId, {
    cancel_at_period_end: true,
  });

  return JSON.stringify(subscriptions);
};
