"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/settings";

export async function updateProfile(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: parsed.data.username,
        ...(parsed.data.image !== undefined ? { image: parsed.data.image } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: { username: ["That username is already taken"] } };
    }
    throw error;
  }

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
