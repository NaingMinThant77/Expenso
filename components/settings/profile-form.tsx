"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, CalendarClock, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "./avatar-upload";
import { profileSchema, type ProfileInput } from "@/lib/validations/settings";
import { updateProfile } from "@/lib/actions/settings";

type Props = {
  username: string;
  email: string;
  image?: string | null;
  memberSince: Date;
};

export function ProfileForm({ username, email, image, memberSince }: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username, image: image ?? undefined },
  });

  const currentImage = watch("image");

  function onSubmit(values: ProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result?.error) {
        const message =
          typeof result.error === "string"
            ? result.error
            : result.error.username?.[0] ?? "Something went wrong";
        toast.error(message);
        return;
      }
      toast.success("Profile updated");
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-24 bg-gradient-to-r from-primary/80 via-primary to-emerald-400" />

      <div className="flex flex-col items-center gap-1 px-6 pb-6">
        <div className="-mt-12">
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <AvatarUpload username={username} image={currentImage} onChange={field.onChange} />
            )}
          />
        </div>

        <h2 className="mt-2 text-lg font-semibold">{username}</h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="size-3.5" />
          {email}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          Member since{" "}
          {memberSince.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex w-full max-w-sm flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="username" className="pl-10" {...register("username")} />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}
