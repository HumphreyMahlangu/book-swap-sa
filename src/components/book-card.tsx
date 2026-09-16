import { Link } from "@tanstack/react-router";
import { BookOpen, MapPin } from "lucide-react";

import type { Listing } from "@/lib/data/types";

export const rand = (n: number) => `R${n.toLocaleString("en-ZA")}`;

export function ConditionPill({ condition }: { condition: Listing["condition"] }) {
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {condition}
    </span>
  );
}

export function BookCover({ listing, className = "" }: { listing: Listing; className?: string }) {
  if (listing.imageUrl) {
    return (
      <img
        src={listing.imageUrl}
        alt={`Cover of ${listing.title}`}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-brand-light/60 p-3 text-center ${className}`}
    >
      <BookOpen className="h-6 w-6 text-primary" />
      <span className="line-clamp-3 text-[11px] font-medium text-primary-dark">
        {listing.title}
      </span>
    </div>
  );
}

export function BookCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to="/books/$id"
      params={{ id: listing.id }}
      className="group flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md sm:flex-col"
    >
      <div className="h-32 w-24 shrink-0 overflow-hidden sm:h-40 sm:w-full">
        <BookCover listing={listing} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-primary-dark">{listing.title}</h3>
          {listing.listingType !== "sell" ? (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
              SWAP
            </span>
          ) : null}
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">{listing.author}</p>
        <p className="text-xs text-muted-foreground">{listing.module}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-primary">{rand(listing.price)}</span>
          <ConditionPill condition={listing.condition} />
        </div>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {listing.campus}
        </p>
      </div>
    </Link>
  );
}
