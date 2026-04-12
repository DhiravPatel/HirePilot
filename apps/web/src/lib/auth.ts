import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { syncUser } from "@/lib/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const email = profile.email;
        if (email) {
          token.email = email;
        }
        if (profile.sub) {
          token.sub = profile.sub;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await syncUser({
            email: user.email || "",
            name: user.name || "",
            image: user.image || "",
            googleId: profile?.sub || "",
          });
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
      return true;
    },
  },
});
