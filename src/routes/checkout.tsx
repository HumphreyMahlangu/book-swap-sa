import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/data/store";
import type { Order } from "@/lib/data/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Book Swap SA" },
      {
        name: "description",
        content: "Student checkout for arranging textbook collection or campus delivery.",
      },
      { property: "og:title", content: "Checkout — Book Swap SA" },
      {
        property: "og:description",
        content: "Place a textbook order using a simulated card or payment arrangement.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <CheckoutPage />
    </AppShell>
  ),
});

const CARD_PAYMENT = "Simulated card payment";
const PAYMENTS = [CARD_PAYMENT, "Pay on collection", "EFT simulation"];

type CardDetails = {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
};

const EMPTY_CARD_DETAILS: CardDetails = {
  name: "",
  number: "",
  expiry: "",
  cvv: "",
};

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function validateCard(details: CardDetails) {
  const errors: Partial<Record<keyof CardDetails, string>> = {};
  const cardDigits = details.number.replace(/\D/g, "");

  if (!details.name.trim()) errors.name = "Enter a cardholder name.";
  if (cardDigits.length < 12) errors.number = "Enter at least 12 digits.";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiry)) {
    errors.expiry = "Use MM/YY format.";
  }
  if (!/^\d{3,4}$/.test(details.cvv)) errors.cvv = "Enter 3 or 4 digits.";

  return errors;
}

function CheckoutPage() {
  const { cart, listingById, placeOrder } = useApp();
  const navigate = useNavigate();
  const [fulfilment, setFulfilment] = useState<Order["fulfilment"]>("collection");
  const [payment, setPayment] = useState(PAYMENTS[0]!);
  const [cardDetails, setCardDetails] = useState<CardDetails>(EMPTY_CARD_DETAILS);
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});
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
                    {option === "collection"
                      ? "Meet the seller on campus"
                      : "Seller drops it off on campus"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary-dark">Payment arrangement</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> This demo never charges a card.
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

            {payment === CARD_PAYMENT ? (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-background/60 p-4">
                <p className="text-sm font-semibold text-primary-dark">Demo card details</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use test details only. Any correctly formatted values are accepted and nothing
                  entered here is sent or saved.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="card-name">Cardholder name</Label>
                    <Input
                      id="card-name"
                      autoComplete="off"
                      value={cardDetails.name}
                      onChange={(event) => {
                        setCardDetails((current) => ({ ...current, name: event.target.value }));
                        setCardErrors((current) => ({ ...current, name: undefined }));
                      }}
                      placeholder="Test User"
                      className="mt-1 rounded-xl"
                      aria-invalid={Boolean(cardErrors.name)}
                    />
                    {cardErrors.name ? (
                      <p className="mt-1 text-xs text-destructive">{cardErrors.name}</p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="card-number">Card number</Label>
                    <Input
                      id="card-number"
                      autoComplete="off"
                      inputMode="numeric"
                      value={cardDetails.number}
                      onChange={(event) => {
                        setCardDetails((current) => ({
                          ...current,
                          number: formatCardNumber(event.target.value),
                        }));
                        setCardErrors((current) => ({ ...current, number: undefined }));
                      }}
                      placeholder="4242 4242 4242 4242"
                      className="mt-1 rounded-xl"
                      aria-invalid={Boolean(cardErrors.number)}
                    />
                    {cardErrors.number ? (
                      <p className="mt-1 text-xs text-destructive">{cardErrors.number}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="card-expiry">Expiry</Label>
                    <Input
                      id="card-expiry"
                      autoComplete="off"
                      inputMode="numeric"
                      value={cardDetails.expiry}
                      onChange={(event) => {
                        setCardDetails((current) => ({
                          ...current,
                          expiry: formatExpiry(event.target.value),
                        }));
                        setCardErrors((current) => ({ ...current, expiry: undefined }));
                      }}
                      placeholder="12/30"
                      className="mt-1 rounded-xl"
                      aria-invalid={Boolean(cardErrors.expiry)}
                    />
                    {cardErrors.expiry ? (
                      <p className="mt-1 text-xs text-destructive">{cardErrors.expiry}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      autoComplete="off"
                      inputMode="numeric"
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(event) => {
                        setCardDetails((current) => ({
                          ...current,
                          cvv: event.target.value.replace(/\D/g, "").slice(0, 4),
                        }));
                        setCardErrors((current) => ({ ...current, cvv: undefined }));
                      }}
                      placeholder="123"
                      className="mt-1 rounded-xl"
                      aria-invalid={Boolean(cardErrors.cvv)}
                    />
                    {cardErrors.cvv ? (
                      <p className="mt-1 text-xs text-destructive">{cardErrors.cvv}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
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
              if (payment === CARD_PAYMENT) {
                const errors = validateCard(cardDetails);
                if (Object.keys(errors).length) {
                  setCardErrors(errors);
                  toast.error("Complete the demo card details before placing the order");
                  return;
                }
              }

              setBusy(true);
              try {
                const order = await placeOrder({
                  fulfilment,
                  payment,
                  ...(note.trim() ? { note: note.trim() } : {}),
                });
                toast.success(`Order ${order.orderNumber} placed`);
                navigate({ to: "/orders/$id", params: { id: order.id } });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not place the order");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Placing order…" : "Place order"}
          </Button>
        </aside>
      </div>
    </>
  );
}
