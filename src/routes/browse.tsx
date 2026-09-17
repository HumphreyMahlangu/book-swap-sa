import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/data/store";
import { CAMPUSES, CATEGORIES, CONDITIONS } from "@/lib/data/types";

interface BrowseSearch {
  q?: string;
  category?: string;
  condition?: string;
  campus?: string;
  type?: string;
  sort?: string;
}

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
    ...(typeof search["condition"] === "string" ? { condition: search["condition"] } : {}),
    ...(typeof search["campus"] === "string" ? { campus: search["campus"] } : {}),
    ...(typeof search["type"] === "string" ? { type: search["type"] } : {}),
    ...(typeof search["sort"] === "string" ? { sort: search["sort"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Browse textbooks — SecondHand Textbook Swap" },
      {
        name: "description",
        content:
          "Search and filter second-hand university textbooks by module, category, condition and campus.",
      },
      { property: "og:title", content: "Browse textbooks — SecondHand Textbook Swap" },
      { property: "og:description", content: "Find affordable used textbooks listed by students." },
    ],
  }),
  component: () => (
    <AppShell>
      <BrowsePage />
    </AppShell>
  ),
});

function BrowsePage() {
  const search = Route.useSearch();
  const filters = {
    q: search.q ?? "",
    category: search.category ?? "all",
    condition: search.condition ?? "all",
    campus: search.campus ?? "all",
    type: search.type ?? "all",
    sort: search.sort ?? "newest",
  };
  const navigate = useNavigate({ from: Route.fullPath });
  const { data } = useApp();

  const update = (patch: Partial<BrowseSearch>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }) });

  const term = filters.q.trim().toLowerCase();
  let results = data.listings.filter((l) => l.status === "active");
  if (term) {
    results = results.filter((l) =>
      [l.title, l.author, l.module, l.isbn, l.category].join(" ").toLowerCase().includes(term),
    );
  }
  if (filters.category !== "all") results = results.filter((l) => l.category === filters.category);
  if (filters.condition !== "all") results = results.filter((l) => l.condition === filters.condition);
  if (filters.campus !== "all") results = results.filter((l) => l.campus === filters.campus);
  if (filters.type !== "all")
    results = results.filter((l) => l.listingType === filters.type || l.listingType === "both");

  results = [...results].sort((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <>
      <PageHeader title="Browse textbooks" subtitle={`${results.length} matching listings`} />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search title, author, module or ISBN"
            className="pl-9"
            aria-label="Search textbooks"
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect
            label="Category"
            value={filters.category}
            options={CATEGORIES}
            onChange={(v) => update({ category: v })}
          />
          <FilterSelect
            label="Condition"
            value={filters.condition}
            options={CONDITIONS}
            onChange={(v) => update({ condition: v })}
          />
          <FilterSelect
            label="Campus"
            value={filters.campus}
            options={CAMPUSES}
            onChange={(v) => update({ campus: v })}
          />
          <FilterSelect
            label="Type"
            value={filters.type}
            options={["sell", "swap"]}
            onChange={(v) => update({ type: v })}
          />
          <Select value={filters.sort} onValueChange={(v) => update({ sort: v })}>
            <SelectTrigger aria-label="Sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {results.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((l) => (
              <BookCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No textbooks match your filters"
            description="Try clearing a filter or searching for a different module code."
          />
        )}
      </div>
    </>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o === "sell" ? "For sale" : o === "swap" ? "For swap" : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
