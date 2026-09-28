import { BookOpen } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <BookOpen className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-card bg-gold" />
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-base font-bold text-primary">Book Swap SA</span>
          <span className="block text-[10px] font-semibold tracking-[0.2em] text-gold">
            BUY • SELL • SWAP
          </span>
        </span>
      ) : null}
    </span>
  );
}
