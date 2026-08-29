"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  username: string;
  email: string;
  image?: string | null;
};

export function UserMenu({ username, email, image }: Props) {
  return (
    <div className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left outline-none hover:bg-muted">
      <Avatar className="size-8">
        <AvatarImage src={image ?? undefined} alt={username} />
        <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{username}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
