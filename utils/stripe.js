import Stripe from "stripe";

if (!process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY) {
  throw new Error(
    "NEXT_PUBLIC_STRIPE_SECRET_KEY is missing. Please set the environment variable."
  );
}

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default stripe;
