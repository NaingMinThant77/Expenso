import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

const PUBLIC_PATHS = ["/login", "/register"];

async function generateUsernameFromEmail(email: string) {
  const base =
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "user";

  let username = base;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${base}${suffix}`;
  }
  return username;
}

const baseAdapter = PrismaAdapter(prisma);
const baseCreateUser = baseAdapter.createUser;
if (!baseCreateUser) throw new Error("Prisma adapter is missing createUser");

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...baseAdapter,
    async createUser(user) {
      const username = await generateUsernameFromEmail(user.email);
      return baseCreateUser({ ...user, username } as Parameters<typeof baseCreateUser>[0]);
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.username, image: user.image };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
    authorized({ request, auth: session }) {
      const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);
      if (!session?.user && !isPublic) return false;
      if (session?.user && isPublic) {
        return Response.redirect(new URL("/", request.nextUrl));
      }
      return true;
    },
  },
});
