import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToSubscriptions } from "@/lib/push";

// Rotated daily so the reminder doesn't go stale — every entry nudges the
// same action (log today's income/expense) in a different, upbeat voice.
const MESSAGES = [
  { title: "💰 Money check-in time!", body: "Start recording today's income and expenses — takes 30 seconds." },
  { title: "📒 Don't lose track today", body: "A quick log now keeps your budget honest. Add today's spending!" },
  { title: "✨ Little logs, big savings", body: "Jot down what you earned and spent today before you forget." },
  { title: "📊 Keep the streak going!", body: "Open Expenso and record today's income and expenses." },
  { title: "🪙 Where did today's money go?", body: "Log your income and expenses now while it's fresh in mind." },
];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  const result = await sendPushToSubscriptions(subscriptions, {
    ...message,
    url: "/",
  });

  return NextResponse.json({ recipients: subscriptions.length, ...result });
}
