import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "@/lib/db/models/index";
import authConfig from "@/lib/auth.config";
import { isRateLimited } from "@/lib/rate-limit";

// No adapter: this project is Credentials-only (no OAuth), and NextAuth's
// JWT session strategy needs no Adapter to persist sessions — Account/Session/
// VerificationToken tables (an adapter's job) simply aren't needed here.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        // Cap failed attempts per email to slow down credential brute-forcing,
        // independent of the caller's IP (which an attacker can rotate).
        if (isRateLimited(`login:${email.toLowerCase()}`, 10, 15 * 60 * 1000)) return null;

        const user = await User.findOne({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
