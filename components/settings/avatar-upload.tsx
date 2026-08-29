"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  username: string;
  image?: string | null;
  onChange: (dataUrl: string) => void;
};

const MAX_SIZE = 256;

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarUpload({ username, image, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    try {
      const dataUrl = await resizeToDataUrl(file);
      onChange(dataUrl);
    } catch {
      toast.error("Couldn't process that image");
    }
  }

  return (
    <div className="relative inline-block">
      <Avatar className="size-24 border-4 border-card shadow-jelly">
        <AvatarImage src={image ?? undefined} alt={username} />
        <AvatarFallback className="text-2xl">
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Change photo"
        className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-[0_2px_0_0_var(--primary-shadow)] transition-all duration-150 ease-jelly hover:scale-105 active:translate-y-[2px] active:shadow-none"
      >
        <Camera className="size-3.5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
