"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Category } from "@prisma/client";

type Props = {
  categories: Category[];
};

export function TransactionFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search, 300);

  const type = searchParams.get("type") ?? "ALL";
  const category = searchParams.get("category") ?? "ALL";

  function updateParam(key: string, value: string) {
    // Read from the live URL rather than the `searchParams` snapshot: two
    // filters changed in quick succession (e.g. clearing search right
    // before picking a type) can otherwise race, with the second push
    // built from a stale pre-navigation snapshot that resurrects the
    // param the first push just removed.
    const params = new URLSearchParams(window.location.search);
    if (value === "ALL" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    const qs = params.toString();
    // A bare trailing "?" (empty query string) gets silently dropped by
    // the router instead of clearing params, so omit it entirely here.
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("q") ?? "")) {
      updateParam("q", debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shop or memo..."
          className="pl-10"
        />
      </div>

      <Tabs value={type} onValueChange={(v) => updateParam("type", v)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="ALL" className="flex-1 sm:flex-none sm:px-4">
            All
          </TabsTrigger>
          <TabsTrigger value="EXPENSE" className="flex-1 sm:flex-none sm:px-4">
            Spent
          </TabsTrigger>
          <TabsTrigger value="INCOME" className="flex-1 sm:flex-none sm:px-4">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Select value={category} onValueChange={(v) => updateParam("category", v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
