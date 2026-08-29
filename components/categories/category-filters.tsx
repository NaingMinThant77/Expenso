"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function CategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search, 300);
  const type = searchParams.get("type") ?? "ALL";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value === "ALL" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
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
          placeholder="Search categories..."
          className="pl-10"
        />
      </div>

      <Tabs value={type} onValueChange={(v) => updateParam("type", v)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="ALL" className="flex-1 sm:flex-none sm:px-4">
            All
          </TabsTrigger>
          <TabsTrigger value="EXPENSE" className="flex-1 sm:flex-none sm:px-4">
            Expense
          </TabsTrigger>
          <TabsTrigger value="INCOME" className="flex-1 sm:flex-none sm:px-4">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
