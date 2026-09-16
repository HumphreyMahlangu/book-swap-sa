import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { BookCover, rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/listings")({
  head: () => ({
    meta: [
      { title: "My listings — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Manage the textbooks you listed: edit, mark as sold or swapped, or delete.",
      },
      { property: "og:title", content: "My listings — SecondHand Textbook Swap" },
      { property: "og:description", content: "Edit and manage your published textbook listings." },
    ],
  }),
  component: () => (
    <AppShell>
      <MyListings />
    </AppShell>
  ),
});

function MyListings() {
  const { data, user, updateListing, deleteListing } = useApp();
  const mine = data.listings
    .filter((l) => l.sellerId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader
        title="My listings"
        subtitle={`${mine.length} textbook${mine.length === 1 ? "" : "s"} listed`}
        action={
          <Button asChild className="rounded-xl">
            <Link to="/sell">Add listing</Link>
          </Button>
        }
      />
      {mine.length === 0 ? (
        <EmptyState
          title="You haven't listed anything yet"
          description="Publish your first textbook and students on your campus will see it right away."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/sell">Sell a textbook</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {mine.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
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
                  {listing.module} · {rand(listing.price)} ·{" "}
                  <span className="font-semibold uppercase">{listing.status}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link to="/listings/$id/edit" params={{ id: listing.id }}>
                    Edit
                  </Link>
                </Button>
                {listing.status === "active" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={async () => {
                        await updateListing(listing.id, { status: "sold" });
                        toast.success("Marked as sold");
                      }}
                    >
                      Mark sold
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={async () => {
                        await updateListing(listing.id, { status: "swapped" });
                        toast.success("Marked as swapped");
                      }}
                    >
                      Mark swapped
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={async () => {
                      await updateListing(listing.id, { status: "active" });
                      toast.success("Listing re-activated");
                    }}
                  >
                    Re-activate
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-destructive"
                  onClick={async () => {
                    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`))
                      return;
                    await deleteListing(listing.id);
                    toast.success("Listing deleted");
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
