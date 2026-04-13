import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { syncUser } from "@/lib/api";
import { SignJWT } from "jose";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "");

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
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        if (profile.email) {
          token.email = profile.email;
        }
        if (profile.sub) {
          token.sub = profile.sub;
        }
        if (profile.name) {
          token.name = profile.name;
        }
        if ((profile as { picture?: string }).picture) {
          token.picture = (profile as { picture?: string }).picture;
        }
      }
      if (user?.name) token.name = user.name;
      if (user?.image) token.picture = user.image;

      // Generate a simple HMAC-signed JWT for the Go API
      if (token.email) {
        const apiToken = await new SignJWT({
          email: token.email,
          name: token.name,
          picture: token.picture,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("24h")
          .sign(secret);
        token.apiToken = apiToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email;
      }
      if (token.apiToken) {
        session.accessToken = token.apiToken as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Generate a temp token for the sync call
          const tempToken = await new SignJWT({ email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1m")
            .sign(secret);

          await syncUser(
            {
              email: user.email || "",
              name: user.name || "",
              image: user.image || "",
              googleId: profile?.sub || "",
            },
            tempToken,
          );
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
      return true;
    },
  },
});
