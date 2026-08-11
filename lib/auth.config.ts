import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/db/models/User";

// Edge-safe subset of the Auth.js config — no Sequelize, no bcrypt.
// Used directly by proxy.ts; lib/auth.ts extends this with the
// Node-only Credentials provider for Route Handlers/Server Actions/Server Components.
export default {
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role as Role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
