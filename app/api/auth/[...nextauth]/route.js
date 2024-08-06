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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        try {
          session.user.id = token.id || token.sub;

          const subscription = await searchStripeSubscriptions({
            email: session.user.email,
          });

          if (subscription && subscription.length > 0) {
            session.user.subscriptionExpiration =
              subscription[0].current_period_end * 1000;
            session.user = { ...session.user, subscription: subscription[0] };
          }
        } catch (error) {
          console.error("Error in session callback:", error);
          // Optionally set a flag or message in the session to indicate the error
          session.error = "Failed to load user data";
        }
      }

      return session;
    },
  },
  debug:
    process.env.NODE_ENV === "development" &&
    process.env.NEXTAUTH_DEBUG === "true",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
