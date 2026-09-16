import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { ListingForm } from "@/components/listing-form";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/listings/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit listing — SecondHand Textbook Swap" },
      { name: "description", content: "Update the price, condition or details of your textbook listing." },
      { property: "og:title", content: "Edit listing — SecondHand Textbook Swap" },
      { property: "og:description", content: "Change your textbook listing details at any time." },
    ],
  }),
  component: () => (
    <AppShell>
      <EditListing />
    </AppShell>
  ),
});

function EditListing() {
  const { id } = Route.useParams();
  const { listingById, updateListing } = useApp();
  const navigate = useNavigate();
  const listing = listingById(id);

  if (!listing) {
    return (
      <EmptyState
        title="Listing not found"
        description="This listing no longer exists."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/listings">Back to my listings</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Edit listing" subtitle={listing.title} />
      <ListingForm
        initial={listing}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateListing(listing.id, values);
          toast.success("Listing updated");
          navigate({ to: "/listings" });
        }}
      />
    </>
  );
}
