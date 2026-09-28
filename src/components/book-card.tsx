import { Link } from "@tanstack/react-router";
import { BookOpen, Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";

import type { Listing } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const rand = (n: number) => `R${n.toLocaleString("en-ZA")}`;

export function ConditionPill({ condition }: { condition: Listing["condition"] }) {
  return (
    <span className="rounded-full bg-olive/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-olive">
      {condition}
    </span>
  );
}

export function ListingTypeBadge({ type }: { type: Listing["listingType"] }) {
  const label = type === "both" ? "Sell + Swap" : type === "swap" ? "Swap" : "Sell";
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        type === "sell" ? "bg-primary/10 text-primary" : "bg-gold-soft text-primary",
      )}
    >
      {label}
    </span>
  );
}

export function BookCover({ listing, className = "" }: { listing: Listing; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (listing.imageUrl && !imageFailed) {
    return (
      <img
        src={listing.imageUrl}
        alt={`Cover of ${listing.title}`}
        loading="lazy"
        onError={() => setImageFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-brand-light p-3 text-center ${className}`}
    >
      <BookOpen className="h-7 w-7 text-primary" />
      <span className="line-clamp-3 text-xs font-semibold text-primary">{listing.title}</span>
    </div>
  );
}

export function BookCard({ listing, rating }: { listing: Listing; rating?: number }) {
  const [fav, setFav] = useState(false);
  return (
    <Link
      to="/books/$id"
      params={{ id: listing.id }}
      className="group card-surface hover-lift flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <BookCover
          listing={listing}
          className="transition duration-300 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          aria-label={fav ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={fav}
          onClick={(e) => {
            e.preventDefault();
            setFav((v) => !v);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-primary shadow-soft transition hover:scale-110"
        >
          <Heart className={cn("h-4 w-4 transition", fav && "fill-gold text-gold")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <ListingTypeBadge type={listing.listingType} />
          <ConditionPill condition={listing.condition} />
        </div>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-primary">{listing.title}</h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {listing.author} · <span className="font-medium">{listing.module}</span>
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {rating ? (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {rating.toFixed(1)}
            </span>
          ) : null}
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5" /> {listing.campus}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-xl font-bold text-gold">{rand(listing.price)}</span>
          <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition group-hover:bg-olive">
            View book
          </span>
        </div>
      </div>
    </Link>
  );
}
