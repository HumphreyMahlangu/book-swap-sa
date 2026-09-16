import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PlusCircle, Repeat2, Search, ShoppingBag } from "lucide-react";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";
import { CATEGORIES } from "@/lib/data/types";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Your campus textbook marketplace dashboard: newest listings, swaps and orders.",
      },
      { property: "og:title", content: "Home — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Newest second-hand textbooks listed by students on your campus.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <HomePage />
    </AppShell>
  ),
});

function HomePage() {
  const { user, data } = useApp();
  const active = data.listings.filter((l) => l.status === "active");
  const recent = [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const swappable = active.filter((l) => l.listingType !== "sell").slice(0, 3);
  const myOrders = data.orders.filter((o) => o.buyerId === user?.id);

  return (
    <>
      <PageHeader
        title={`Hi ${user?.fullName.split(" ")[0] ?? "there"} 👋`}
        subtitle={`${active.length} textbooks available near ${user?.campus ?? "your campus"}`}
        action={
          <Button asChild className="rounded-xl">
            <Link to="/sell">
              <PlusCircle className="mr-2 h-4 w-4" /> Sell a textbook
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { to: "/browse", label: "Browse books", icon: Search, value: `${active.length} listed` },
          {
            to: "/swaps",
            label: "Swap requests",
            icon: Repeat2,
            value: `${data.swaps.length} total`,
          },
          {
            to: "/orders",
            label: "My orders",
            icon: ShoppingBag,
            value: `${myOrders.length} orders`,
          },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <card.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-primary-dark">{card.label}</span>
              <span className="block text-xs text-muted-foreground">{card.value}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary-dark">Newly listed</h2>
          <Link to="/browse" className="flex items-center gap-1 text-sm font-medium text-primary">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recent.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((l) => (
              <BookCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No textbooks yet"
            description="Be the first to list a textbook for your module."
            action={
              <Button asChild className="rounded-xl">
                <Link to="/sell">List a textbook</Link>
              </Button>
            }
          />
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-primary-dark">Browse by category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/browse"
              search={{
                q: "",
                category: c,
                condition: "all",
                campus: "all",
                type: "all",
                sort: "newest",
              }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary-dark transition hover:bg-secondary"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {swappable.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-primary-dark">Open to swaps</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {swappable.map((l) => (
              <BookCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
