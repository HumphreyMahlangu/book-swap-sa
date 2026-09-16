import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, MapPin } from "lucide-react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details — SecondHand Textbook Swap" },
      { name: "description", content: "Order status timeline, seller contact and collection details for your textbook order." },
      { property: "og:title", content: "Order details — SecondHand Textbook Swap" },
      { property: "og:description", content: "Follow your textbook order from confirmation to collection." },
    ],
  }),
  component: () => (
    <AppShell>
      <OrderDetail />
    </AppShell>
  ),
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { data, userById, completeOrder } = useApp();
  const order = data.orders.find((o) => o.id === id);

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="We couldn't find that order."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/orders">Back to orders</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed ${new Date(order.createdAt).toLocaleString("en-ZA")} · ${order.payment}`}
        action={
          order.status === "active" ? (
            <Button
              className="rounded-xl"
              onClick={async () => {
                await completeOrder(order.id);
                toast.success("Order marked as completed");
              }}
            >
              Mark as completed
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary-dark">Status</h2>
            <ol className="mt-3 space-y-3">
              {order.timeline.map((step) => (
                <li key={step.label} className="flex items-start gap-3">
                  {step.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-primary-dark">{step.label}</p>
                    {step.at ? (
                      <p className="text-xs text-muted-foreground">
                        {new Date(step.at).toLocaleString("en-ZA")}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary-dark">Textbooks</h2>
            <ul className="mt-3 space-y-3">
              {order.items.map((item) => (
                <li key={item.listingId} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <Link
                      to="/books/$id"
                      params={{ id: item.listingId }}
                      className="font-medium text-primary-dark hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Seller: {userById(item.sellerId)?.fullName ?? "Student"}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">{rand(item.price)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-primary-dark">Meeting details</h2>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {order.meetingDetails}
          </p>
          {order.note ? (
            <p className="rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">"{order.note}"</p>
          ) : null}
          <div className="flex justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{rand(order.total)}</span>
          </div>
        </aside>
      </div>
    </>
  );
}
