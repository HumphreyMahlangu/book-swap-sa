import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Circle, MapPin, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/data/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details — SecondHand Textbook Swap" },
      {
        name: "description",
        content:
          "Order status timeline, seller contact and collection details for your textbook order.",
      },
      { property: "og:title", content: "Order details — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Follow your textbook order from confirmation to collection.",
      },
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
  const navigate = useNavigate();
  const { data, user, userById, completeOrder, addReview, openConversation } = useApp();
  const order = data.orders.find((o) => o.id === id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const existingReview = data.reviews.find((r) => r.orderId === order.id);
  const primarySellerId = order.items[0]?.sellerId;
  const primarySeller = primarySellerId ? userById(primarySellerId) : undefined;
  const isBuyer = user?.id === order.buyerId;

  const handleMessageSeller = async (sellerId: string, listingId?: string) => {
    try {
      const cid = await openConversation(sellerId, listingId);
      navigate({ to: "/messages/$conversationId", params: { conversationId: cid } });
    } catch {
      toast.error("Could not start conversation");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primarySellerId) return;
    setSubmittingReview(true);
    try {
      await addReview({
        sellerId: primarySellerId,
        rating,
        comment: comment.trim() || "Great student seller, smooth textbook handover!",
        orderId: order.id,
      });
      toast.success("Thank you! Your review has been published.");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

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
                <li
                  key={item.listingId}
                  className="flex flex-wrap items-center justify-between gap-3 text-sm"
                >
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
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">{rand(item.price)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs h-8"
                      onClick={() => handleMessageSeller(item.sellerId, item.listingId)}
                    >
                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Seller Review Section */}
          {order.status === "completed" && isBuyer && primarySeller && (
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-primary-dark">
                Seller Review: {primarySeller.fullName}
              </h2>
              {existingReview ? (
                <div className="mt-3 rounded-xl bg-secondary/50 p-3.5 text-xs">
                  <div className="flex items-center gap-1 text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < existingReview.rating
                            ? "fill-accent"
                            : "text-border fill-transparent",
                        )}
                      />
                    ))}
                    <span className="ml-1.5 font-semibold text-foreground">
                      {existingReview.rating} / 5 Stars
                    </span>
                  </div>
                  <p className="mt-2 text-foreground/90">"{existingReview.comment}"</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Reviewed on {new Date(existingReview.at).toLocaleDateString("en-ZA")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="mt-3 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    How was your textbook collection with {primarySeller.fullName.split(" ")[0]}?
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-accent transition hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            star <= rating
                              ? "fill-accent text-accent"
                              : "text-border fill-transparent",
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">
                      {rating} of 5 stars
                    </span>
                  </div>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a brief comment (e.g. Prompt meetup at the library, textbook exactly as described)..."
                    className="min-h-[70px] rounded-xl text-xs"
                    rows={2}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-xl"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              )}
            </section>
          )}
        </div>

        <aside className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-primary-dark">Meeting details</h2>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {order.meetingDetails}
          </p>
          {order.note ? (
            <p className="rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
              "{order.note}"
            </p>
          ) : null}
          <div className="flex justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{rand(order.total)}</span>
          </div>

          {primarySeller && (
            <div className="border-t border-border pt-3">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => handleMessageSeller(primarySeller.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Message Seller
              </Button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
