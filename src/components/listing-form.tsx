import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp, type NewListingInput } from "@/lib/data/store";
import { CAMPUSES, CATEGORIES, CONDITIONS, type Listing } from "@/lib/data/types";

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground";

export function ListingForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Listing;
  submitLabel: string;
  onSubmit: (values: NewListingInput) => Promise<void>;
}) {
  const { user, uploadImage } = useApp();
  const [values, setValues] = useState<NewListingInput>({
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    edition: initial?.edition ?? "",
    isbn: initial?.isbn ?? "",
    module: initial?.module ?? "",
    category: initial?.category ?? CATEGORIES[0],
    condition: initial?.condition ?? "Good",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    campus: initial?.campus ?? user?.campus ?? CAMPUSES[0],
    listingType: initial?.listingType ?? "sell",
    imageUrl: initial?.imageUrl,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof NewListingInput>(key: K, value: NewListingInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!values.title.trim() || !values.author.trim() || !values.module.trim()) {
          setError("Title, author and module code are required.");
          return;
        }
        if (values.listingType !== "swap" && values.price <= 0) {
          setError("Enter a price greater than R0, or change the listing type to Swap.");
          return;
        }
        setError(null);
        setBusy(true);
        try {
          await onSubmit(values);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {error ? (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Label className="text-sm font-semibold text-primary-dark">Cover photo (optional)</Label>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-28 w-20 overflow-hidden rounded-xl border border-border bg-brand-light/50">
            {values.imageUrl ? (
              <img
                src={values.imageUrl}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <Input
            type="file"
            accept="image/*"
            className="max-w-xs rounded-xl"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await uploadImage(file);
              set("imageUrl", url);
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2">
        <Field label="Title" value={values.title} onChange={(v) => set("title", v)} required />
        <Field label="Author" value={values.author} onChange={(v) => set("author", v)} required />
        <Field label="Edition" value={values.edition} onChange={(v) => set("edition", v)} />
        <Field label="ISBN" value={values.isbn} onChange={(v) => set("isbn", v)} />
        <Field
          label="Module code"
          value={values.module}
          onChange={(v) => set("module", v)}
          required
        />
        <div>
          <Label htmlFor="price">Price (ZAR)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            className="mt-1 rounded-xl"
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className={`mt-1 ${selectClass}`}
            value={values.category}
            onChange={(e) => set("category", e.target.value as Listing["category"])}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="condition">Condition</Label>
          <select
            id="condition"
            className={`mt-1 ${selectClass}`}
            value={values.condition}
            onChange={(e) => set("condition", e.target.value as Listing["condition"])}
          >
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="campus">Campus</Label>
          <select
            id="campus"
            className={`mt-1 ${selectClass}`}
            value={values.campus}
            onChange={(e) => set("campus", e.target.value)}
          >
            {CAMPUSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="listingType">Listing type</Label>
          <select
            id="listingType"
            className={`mt-1 ${selectClass}`}
            value={values.listingType}
            onChange={(e) => set("listingType", e.target.value as Listing["listingType"])}
          >
            <option value="sell">Sell</option>
            <option value="swap">Swap</option>
            <option value="both">Sell or Swap</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            className="mt-1 rounded-xl"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Mention highlighting, missing pages, access codes, etc."
          />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-xl sm:w-auto" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={id}
        className="mt-1 rounded-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
