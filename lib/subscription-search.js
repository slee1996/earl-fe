"use server";
import stripe from "@/utils/stripe";

export const searchStripeSubscriptions = async ({ email }) => {
  const customer = await stripe.customers.search({
    query: `email:'${email}'`,
  });
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.data[0].id,
    status: "active",
  });

  return subscriptions.data;
};
