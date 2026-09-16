import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { BookCover, rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Review the second-hand textbooks you plan to buy before checkout.",
      },
      { property: "og:title", content: "Your cart — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Review your selected used textbooks and continue to checkout.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <CartPage />
    </AppShell>
  ),
});

function CartPage() {
  const { cart, listingById, removeFromCart } = useApp();
  const items = cart.map((id) => listingById(id)).filter(Boolean);
  const total = items.reduce((sum, l) => sum + (l?.price ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Your cart"
        subtitle={`${items.length} textbook${items.length === 1 ? "" : "s"}`}
      />
      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse textbooks from students on your campus and add one to your cart."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/browse">Browse textbooks</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((listing) =>
            listing ? (
              <div
                key={listing.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
              >
                <div className="h-20 w-16 overflow-hidden rounded-xl">
                  <BookCover listing={listing} />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/books/$id"
                    params={{ id: listing.id }}
                    className="line-clamp-1 font-medium text-primary-dark hover:underline"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {listing.module} · {listing.campus}
                  </p>
                  <p className="mt-1 font-semibold text-primary">{rand(listing.price)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${listing.title}`}
                  onClick={async () => {
                    await removeFromCart(listing.id);
                    toast.success("Removed from cart");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null,
          )}

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold text-primary">{rand(total)}</span>
            </div>
            <Button asChild className="mt-4 w-full rounded-xl">
              <Link to="/checkout">Continue to checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
