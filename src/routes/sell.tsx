import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ListingForm } from "@/components/listing-form";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell a textbook — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "List your used university textbook for sale or swap in a few seconds.",
      },
      { property: "og:title", content: "Sell a textbook — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Publish your used textbook to students on your campus.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <SellPage />
    </AppShell>
  ),
});

function SellPage() {
  const { createListing } = useApp();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Sell a textbook" subtitle="Add the details students search for." />
      <ListingForm
        submitLabel="Publish listing"
        onSubmit={async (values) => {
          const listing = await createListing(values);
          toast.success("Your textbook is live on Browse");
          navigate({ to: "/books/$id", params: { id: listing.id } });
        }}
      />
    </>
  );
}
