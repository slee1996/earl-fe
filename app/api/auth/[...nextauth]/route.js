import { searchStripeSubscriptions } from "@/lib/subscription-search";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;

        const subscription = await searchStripeSubscriptions({
          email: session.user.email,
        });

        if (subscription.length > 0) {
          session.user.subscriptionExpiration =
            subscription[0].current_period_end * 1000;
          session.user = { ...session.user, subscription: subscription[0] };
        }
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
