import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/data/store";
import type { Order } from "@/lib/data/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — SecondHand Textbook Swap" },
      { name: "description", content: "Simulated student checkout: choose collection or campus delivery and place a demo order." },
      { property: "og:title", content: "Checkout — SecondHand Textbook Swap" },
      { property: "og:description", content: "Place a demo textbook order with no real payment details." },
    ],
  }),
  component: () => (
    <AppShell>
      <CheckoutPage />
    </AppShell>
  ),
});

const PAYMENTS = ["Demo card payment", "Pay on collection", "EFT simulation"];

function CheckoutPage() {
  const { cart, listingById, placeOrder } = useApp();
  const navigate = useNavigate();
  const [fulfilment, setFulfilment] = useState<Order["fulfilment"]>("collection");
  const [payment, setPayment] = useState(PAYMENTS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const items = cart.map((id) => listingById(id)).filter(Boolean);
  const total = items.reduce((sum, l) => sum + (l?.price ?? 0), 0);

  if (!items.length) {
    return (
      <EmptyState
        title="Nothing to check out"
        description="Add a textbook to your cart first."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/browse">Browse textbooks</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Checkout" subtitle="This is a simulation — no real payment is taken." />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary-dark">How will you get the book?</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(["collection", "delivery"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFulfilment(option)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    fulfilment === option
                      ? "border-primary bg-secondary text-primary-dark"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <span className="font-medium capitalize">{option}</span>
                  <span className="block text-xs text-muted-foreground">
                    {option === "collection" ? "Meet the seller on campus" : "Seller drops it off on campus"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary-dark">Payment (demo only)</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> No card or bank details are ever collected.
            </p>
            <div className="mt-3 space-y-2">
              {PAYMENTS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPayment(option)}
                  className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                    payment === option
                      ? "border-primary bg-secondary text-primary-dark"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Label htmlFor="note" className="text-sm font-semibold text-primary-dark">
              Note for the seller (optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. I'm free between lectures on Tuesday."
              className="mt-2 rounded-xl"
            />
          </section>
        </div>

        <aside className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-primary-dark">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((l) =>
              l ? (
                <li key={l.id} className="flex justify-between gap-3">
                  <span className="line-clamp-1 text-muted-foreground">{l.title}</span>
                  <span className="font-medium">{rand(l.price)}</span>
                </li>
              ) : null,
            )}
          </ul>
          <div className="flex justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{rand(total)}</span>
          </div>
          <Button
            className="w-full rounded-xl"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const order = await placeOrder({ fulfilment, note: note || undefined, payment });
                toast.success(`Demo order ${order.orderNumber} placed`);
                navigate({ to: "/orders/$id", params: { id: order.id } });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not place the order");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Placing order…" : "Place demo order"}
          </Button>
        </aside>
      </div>
    </>
  );
}
