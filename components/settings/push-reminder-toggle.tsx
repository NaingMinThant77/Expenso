"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  isPushSupported,
  getExistingPushSubscription,
  subscribeToPushManager,
} from "@/lib/push-client";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/push";

export function PushReminderToggle() {
  const [supported, setSupported] = useState(true);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
      if (!isPushSupported()) {
        if (active) setSupported(false);
        return;
      }
      const subscription = await getExistingPushSubscription();
      if (active) setChecked(!!subscription);
    }

    check();
    return () => {
      active = false;
    };
  }, []);

  async function enable() {
    if (Notification.permission === "denied") {
      toast.error("Notifications are blocked for Expenso in your browser settings.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Allow notifications to turn on daily reminders.");
      return;
    }

    const subscription = await subscribeToPushManager();
    const result = await subscribeToPush(subscription.toJSON());

    if (result?.error) {
      await subscription.unsubscribe();
      toast.error("Couldn't enable reminders. Please try again.");
      return;
    }

    toast.success("Daily reminders enabled — we'll nudge you every day at 8 AM.");
  }

  async function disable() {
    const subscription = await getExistingPushSubscription();
    if (subscription) {
      await unsubscribeFromPush(subscription.endpoint);
      await subscription.unsubscribe();
    }
    toast.success("Daily reminders turned off.");
  }

  async function onCheckedChange(next: boolean) {
    setBusy(true);
    setChecked(next);
    try {
      if (next) {
        await enable();
      } else {
        await disable();
      }
    } catch {
      setChecked(!next);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <BellRing className="size-4" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">Daily Log Reminder</p>
        <p className="text-xs text-muted-foreground">
          Scheduled daily push alarm to log spending
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={busy} />
    </div>
  );
}
