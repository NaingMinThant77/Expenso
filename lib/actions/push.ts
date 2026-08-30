"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pushSubscriptionSchema } from "@/lib/validations/push";
import { sendPushToUser } from "@/lib/push";

export async function subscribeToPush(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid subscription" };

  const { endpoint, keys } = parsed.data;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: session.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { userId: session.user.id, p256dh: keys.p256dh, auth: keys.auth },
  });

  await sendPushToUser(session.user.id, {
    title: "🔔 Reminders are on!",
    body: "We'll nudge you every day at 8 AM to log your income and expenses.",
    url: "/settings",
  });

  return { success: true };
}

export async function unsubscribeFromPush(endpoint: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });

  return { success: true };
}

export async function hasActivePushSubscription() {
  const session = await auth();
  if (!session?.user) return false;

  const count = await prisma.pushSubscription.count({
    where: { userId: session.user.id },
  });
  return count > 0;
}
