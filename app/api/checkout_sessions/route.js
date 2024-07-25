import stripe from "@/utils/stripe";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details?.email,
    });
  } catch (err) {
    return NextResponse.json({
      status: err.statusCode || 500,
      message: err.message,
    });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of
          // the product you want to sell
          price: req.headers.get("origin").includes("localhost")
            ? "price_1PfmXwJjU6H0KLWFFtxB1TdI"
            : "price_1Pfuv1JjU6H0KLWFp34SYMYV",
          quantity: 1,
        },
      ],
      customer_email: data.customer_email,
      allow_promotion_codes: true,
      mode: "subscription",
      return_url: `${req.headers.get(
        "origin"
      )}?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    return NextResponse.json({
      status: err.statusCode || 500,
      message: err.message,
    });
  }
}
