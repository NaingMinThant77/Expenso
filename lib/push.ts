import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Sends a push payload to every subscription for a user, pruning
 * subscriptions the browser has revoked (404/410 from the push service).
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  return sendPushToSubscriptions(subscriptions, payload);
}

export async function sendPushToSubscriptions(
  subscriptions: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      )
    )
  );

  const staleIds = subscriptions
    .filter((_, i) => {
      const result = results[i];
      return (
        result.status === "rejected" &&
        [404, 410].includes((result.reason as { statusCode?: number })?.statusCode ?? 0)
      );
    })
    .map((sub) => sub.id);

  if (staleIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: staleIds } } });
  }

  return {
    sent: results.filter((r) => r.status === "fulfilled").length,
    pruned: staleIds.length,
    failed: results.length - results.filter((r) => r.status === "fulfilled").length - staleIds.length,
  };
}
