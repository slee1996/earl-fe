"use client";
import React, { useCallback, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { cancelSubscription } from "@/lib/cancel-subscription";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function StripeSubscription() {
  const { data: session, update } = useSession();

  const fetchClientSecret = useCallback(async () => {
    const response = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        customer_email: session?.user?.email,
      }),
    });
    const data = await response.json();
    return data.clientSecret;
  }, [session?.user?.email]);

  const options = useMemo(
    () => ({
      fetchClientSecret,
    }),
    [fetchClientSecret]
  );

  const handleCheckoutComplete = useCallback(async () => {
    // Refresh the session to update the user's subscription data
    await update();
    toast("Subscription Updated!");
  }, [update]);

  if (!session?.user) return null;

  const buttonText =
    session.user.subscription &&
    Object.keys(session.user.subscription).length > 0
      ? "Manage Subscription"
      : "Subscribe to pro";

  return (
    <div id="checkout">
      <Dialog>
        <DialogTrigger className="border text-white px-2">
          {buttonText}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            {!session.user.subscription ? (
              <>
                <DialogTitle>Subscription Checkout</DialogTitle>
                <ScrollArea className="h-[600px]">
                  <DialogDescription>
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={options}
                      onCheckoutComplete={handleCheckoutComplete}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </DialogDescription>
                </ScrollArea>
              </>
            ) : (
              <>
                <DialogTitle>Manage Subscription</DialogTitle>
                <ScrollArea className="h-[600px] py-4">
                  {session.user.subscription ? (
                    <DialogDescription className="flex flex-col space-y-2">
                      <span
                        className={
                          session.user.subscription.cancel_at_period_end
                            ? "text-red-500 text-lg font-semibold"
                            : "text-black text-lg"
                        }
                      >
                        Subscription{" "}
                        {session.user.subscription.cancel_at_period_end
                          ? "Expiring"
                          : "Renewing"}
                        :{" "}
                        {new Date(
                          session.user.subscription.current_period_end * 1000
                        ).toDateString()}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger
                          className="bg-red-500 hover:bg-red-600 rounded-sm py-1 text-white disabled:bg-slate-500"
                          disabled={
                            session.user.subscription.cancel_at_period_end
                          }
                        >
                          Cancel Subscription
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              You sure about that?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>
                                This action will cancel your subscription,
                                effective at the end of your current
                                subscription period. Do you want to continue?
                              </p>
                              <p>
                                If you wish to cancel immediately and receive a
                                prorated refund please email
                                spencerlee96@gmail.com with EARL REFUND in the
                                subject line from the email attached to your
                                subscription.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, go back.</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={async () => {
                                const subId = session.user.subscription.id;
                                const updatedSubscription =
                                  await cancelSubscription(subId);
                                session.user.subscription = updatedSubscription;
                                await update(); // Refresh the session
                                toast("Subscription Cancelled!");
                              }}
                            >
                              Yes, cancel it.
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DialogDescription>
                  ) : null}
                </ScrollArea>
              </>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
