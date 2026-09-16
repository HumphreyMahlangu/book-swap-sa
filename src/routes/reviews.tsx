import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle, Star, UserCheck } from "lucide-react";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Student Reviews & Trust — SecondHand Textbook Swap" },
      {
        name: "description",
        content:
          "Verified reviews and ratings from university students exchanging textbooks on campus.",
      },
      { property: "og:title", content: "Student Reviews — SecondHand Textbook Swap" },
    ],
  }),
  component: () => (
    <AppShell>
      <ReviewsPage />
    </AppShell>
  ),
});

function ReviewsPage() {
  const { data, userById } = useApp();
  const allReviews = [...data.reviews].sort((a, b) => b.at.localeCompare(a.at));

  const totalReviews = allReviews.length;
  const avgRating = totalReviews
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  return (
    <>
      <PageHeader
        title="Student Community Reviews"
        subtitle="Verified ratings from university textbook meetups and collections."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/browse">Find textbooks</Link>
          </Button>
        }
      />

      {/* Trust & Reputation Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-xs">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Average Campus Rating
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-2xl font-bold text-primary-dark">
            <Star className="h-6 w-6 fill-accent text-accent" />
            <span>{avgRating ? avgRating.toFixed(1) : "5.0"}</span>
            <span className="text-sm font-normal text-muted-foreground">/ 5.0</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Based on verified exchanges</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-xs">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Total Reviews
          </p>
          <div className="mt-2 text-2xl font-bold text-primary-dark">{totalReviews}</div>
          <p className="mt-1 text-xs text-muted-foreground">From verified student accounts</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-xs">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Campus Verification
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-lg font-bold text-emerald-600">
            <UserCheck className="h-5 w-5" /> 100% Student-to-Student
          </div>
          <p className="mt-1 text-xs text-muted-foreground">In-person public campus handovers</p>
        </div>
      </div>

      {/* Review List */}
      {allReviews.length === 0 ? (
        <EmptyState
          title="No reviews published yet"
          description="Reviews are automatically added after buyers complete textbook orders."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/orders">View my orders</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {allReviews.map((rev) => {
            const seller = userById(rev.sellerId);
            return (
              <div
                key={rev.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-primary-dark">{rev.authorName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Reviewed {seller?.fullName ?? "Seller"} · {seller?.campus ?? "Campus"}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < rev.rating ? "fill-accent" : "text-border fill-transparent",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-foreground/90">"{rev.comment}"</p>
                </div>

                <div className="mt-4 border-t border-border/60 pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Verified Purchase</span>
                  <span>
                    {new Date(rev.at).toLocaleDateString("en-ZA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
