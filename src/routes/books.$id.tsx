import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Repeat2, Share2, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { AppShell, EmptyState } from "@/components/app-shell";
import { BookCover, ConditionPill, rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/books/$id")({
  head: () => ({
    meta: [
      { title: "Textbook details — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Full details, price and seller info for a second-hand university textbook.",
      },
      { property: "og:title", content: "Textbook details — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Buy or swap this used university textbook with a fellow student.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <BookDetail />
    </AppShell>
  ),
});

function BookDetail() {
  const { id } = Route.useParams();
  const { listingById, userById, sellerStats, addToCart, openConversation, user, data } = useApp();
  const navigate = useNavigate();
  const listing = listingById(id);

  if (!listing) {
    return (
      <EmptyState
        title="Textbook not found"
        description="This listing may have been removed or sold."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/browse">Back to browse</Link>
          </Button>
        }
      />
    );
  }

  const seller = userById(listing.sellerId);
  const stats = sellerStats(listing.sellerId);
  const isOwn = user?.id === listing.sellerId;
  const reviews = data.reviews.filter((r) => r.sellerId === listing.sellerId).slice(0, 3);
  const typeLabel =
    listing.listingType === "sell"
      ? "Sell"
      : listing.listingType === "swap"
        ? "Swap"
        : "Sell or Swap";

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-72">
          <BookCover listing={listing} />
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              {listing.category}
            </span>
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              {typeLabel}
            </span>
            <ConditionPill condition={listing.condition} />
            {listing.status !== "active" ? (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase text-muted-foreground">
                {listing.status}
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-primary-dark">
            {listing.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {listing.author} · {listing.edition}
          </p>
          <p className="mt-3 text-3xl font-bold text-primary">{rand(listing.price)}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
          {[
            ["Module", listing.module],
            ["ISBN", listing.isbn],
            ["Campus", listing.campus],
            ["Condition", listing.condition],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium text-primary-dark">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-sm leading-relaxed text-foreground">{listing.description}</p>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Seller</p>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-primary-dark">{seller?.fullName ?? "Student"}</p>
              <p className="text-xs text-muted-foreground">{seller?.institution}</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary-dark">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {stats.rating ? stats.rating.toFixed(1) : "New"}
              <span className="text-xs font-normal text-muted-foreground">
                ({stats.reviewCount})
              </span>
            </span>
          </div>
          {reviews.length ? (
            <ul className="mt-3 space-y-2 border-t border-border pt-3">
              {reviews.map((r) => (
                <li key={r.id} className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary-dark">{r.authorName}</span> · {r.rating}
                  ★ — {r.comment}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {isOwn ? (
            <Button asChild className="rounded-xl">
              <Link to="/listings">Manage your listing</Link>
            </Button>
          ) : (
            <>
              {listing.listingType !== "swap" && listing.status === "active" ? (
                <Button
                  className="rounded-xl"
                  onClick={async () => {
                    const added = await addToCart(listing.id);
                    toast[added ? "success" : "info"](
                      added ? "Added to your cart" : "Already in your cart",
                    );
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to cart
                </Button>
              ) : null}
              {listing.listingType !== "sell" ? (
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/swaps" search={{ target: listing.id }}>
                    <Repeat2 className="mr-2 h-4 w-4" /> Request swap
                  </Link>
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={async () => {
                  const cid = await openConversation(listing.sellerId, listing.id);
                  navigate({ to: "/messages/$conversationId", params: { conversationId: cid } });
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Contact seller
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            className="rounded-xl"
            onClick={async () => {
              const url = `${window.location.origin}/books/${listing.id}`;
              try {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
              } catch {
                toast.info(url);
              }
            }}
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}
