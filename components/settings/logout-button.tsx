"use client";

import { useState, useTransition } from "react";
import { LogOut, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="justify-start gap-2.5 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-destructive/10">
            <LogOut className="size-3.5" />
          </span>
          <span className="font-medium text-sm">Log out</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" />
          </div>
          <DialogTitle>Log out of Expenso?</DialogTitle>
          <DialogDescription>
            You&apos;ll need to sign in again to see your transactions and
            dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => logoutAction())}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
