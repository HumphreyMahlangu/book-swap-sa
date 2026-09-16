import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/data/store";
import type { Order } from "@/lib/data/types";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My orders — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Track your active, completed and cancelled textbook orders.",
      },
      { property: "og:title", content: "My orders — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Track collection details and status for every textbook order.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <OrdersPage />
    </AppShell>
  ),
});

function OrderRow({ order }: { order: Order }) {
  return (
    <Link
      to="/orders/$id"
      params={{ id: order.id }}
      className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-primary-dark">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-ZA")} · {order.items.length} item
            {order.items.length === 1 ? "" : "s"} · {order.fulfilment}
          </p>
        </div>
        <span className="text-lg font-bold text-primary">{rand(order.total)}</span>
      </div>
      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
        {order.items.map((i) => i.title).join(", ")}
      </p>
    </Link>
  );
}

function OrdersPage() {
  const { data, user } = useApp();
  const mine = data.orders
    .filter((o) => o.buyerId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const groups: Record<Order["status"], Order[]> = {
    active: mine.filter((o) => o.status === "active"),
    completed: mine.filter((o) => o.status === "completed"),
    cancelled: mine.filter((o) => o.status === "cancelled"),
  };

  return (
    <>
      <PageHeader
        title="My orders"
        subtitle="Every textbook you've bought through the marketplace."
      />
      <Tabs defaultValue="active">
        <TabsList className="rounded-xl">
          <TabsTrigger value="active">Active ({groups.active.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({groups.completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({groups.cancelled.length})</TabsTrigger>
        </TabsList>
        {(Object.keys(groups) as Order["status"][]).map((key) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {groups[key].length ? (
              groups[key].map((order) => <OrderRow key={order.id} order={order} />)
            ) : (
              <EmptyState
                title={`No ${key} orders`}
                description="Orders you place will show up here with collection details."
                action={
                  <Button asChild className="rounded-xl">
                    <Link to="/browse">Browse textbooks</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
