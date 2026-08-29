"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function registerAction(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return {
      error: {
        email: existing.email === email ? ["Email is already in use"] : undefined,
        username: existing.username === username ? ["Username is already taken"] : undefined,
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { username, email, passwordHash } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: { email: ["Something went wrong signing you in. Try logging in."] } };
    }
    throw error;
  }
}
