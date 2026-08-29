"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function loginAction(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: { email: ["Invalid email or password"] } };
    }
    throw error;
  }
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}
