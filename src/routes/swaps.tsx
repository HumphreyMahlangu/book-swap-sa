import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlusCircle,
  Repeat2,
  X,
  XCircle,
} from "lucide-react";
import { useState, useId } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { BookCover, rand } from "@/components/book-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/data/store";
import type { Listing, SwapRequest } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface SwapsSearch {
  target?: string;
}

export const Route = createFileRoute("/swaps")({
  validateSearch: (search: Record<string, unknown>): SwapsSearch =>
    typeof search["target"] === "string" ? { target: search["target"] } : {},
  head: () => ({
    meta: [
      { title: "Textbook Swaps — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Trade university textbooks course-for-course with students on campus.",
      },
      { property: "og:title", content: "Textbook Swaps — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Propose and manage textbook swap requests with fellow students.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <SwapsPage />
    </AppShell>
  ),
});

function SwapCard({
  swap,
  isIncoming,
  onRespond,
  onOpenChat,
}: {
  swap: SwapRequest;
  isIncoming: boolean;
  onRespond: (id: string, status: SwapRequest["status"]) => Promise<void>;
  onOpenChat: (otherUserId: string, listingId?: string) => Promise<void>;
}) {
  const { listingById, userById } = useApp();
  const targetListing = listingById(swap.targetListingId);
  const offeredListing = listingById(swap.offeredListingId);
  const otherUser = userById(isIncoming ? swap.fromUserId : swap.toUserId);

  const statusConfig = {
    pending: {
      label: "Pending",
      class: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      icon: Clock,
    },
    accepted: {
      label: "Accepted",
      class: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    declined: { label: "Declined", class: "bg-destructive/15 text-destructive", icon: XCircle },
    completed: { label: "Completed", class: "bg-primary/15 text-primary-dark", icon: Check },
  }[swap.status];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <span className="text-xs text-muted-foreground">
            {isIncoming ? "From" : "To"}:{" "}
            <span className="font-semibold text-primary-dark">
              {otherUser?.fullName ?? "Fellow Student"}
            </span>{" "}
            · {otherUser?.campus ?? "Campus"}
          </span>
          <p className="text-[11px] text-muted-foreground">
            Requested {new Date(swap.createdAt).toLocaleDateString("en-ZA")}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            statusConfig.class,
          )}
        >
          <statusConfig.icon className="h-3.5 w-3.5" />
          {statusConfig.label}
        </span>
      </div>

      {/* Books Comparison Grid */}
      <div className="my-4 grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {/* Book 1 (Target) */}
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {isIncoming ? "They want your textbook" : "You want"}
          </p>
          {targetListing ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md border border-border">
                <BookCover listing={targetListing} />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/books/$id"
                  params={{ id: targetListing.id }}
                  className="line-clamp-1 text-sm font-semibold text-primary-dark hover:underline"
                >
                  {targetListing.title}
                </Link>
                <p className="line-clamp-1 text-xs text-muted-foreground">{targetListing.author}</p>
                <p className="text-xs font-medium text-primary">{rand(targetListing.price)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs italic text-muted-foreground">Listing no longer available</p>
          )}
        </div>

        {/* Exchange Arrow */}
        <div className="flex justify-center text-muted-foreground">
          <ArrowLeftRight className="h-5 w-5 rotate-90 sm:rotate-0 text-accent" />
        </div>

        {/* Book 2 (Offered) */}
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {isIncoming ? "Offered in exchange" : "You offered"}
          </p>
          {offeredListing ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md border border-border">
                <BookCover listing={offeredListing} />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/books/$id"
                  params={{ id: offeredListing.id }}
                  className="line-clamp-1 text-sm font-semibold text-primary-dark hover:underline"
                >
                  {offeredListing.title}
                </Link>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {offeredListing.author}
                </p>
                <p className="text-xs font-medium text-primary">{rand(offeredListing.price)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs italic text-muted-foreground">Listing no longer available</p>
          )}
        </div>
      </div>

      {swap.message && (
        <div className="mb-4 rounded-xl bg-secondary/70 p-3 text-xs text-secondary-foreground">
          <span className="font-semibold text-primary-dark">Note: </span>"{swap.message}"
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() =>
            onOpenChat(
              otherUser?.id ?? (isIncoming ? swap.fromUserId : swap.toUserId),
              swap.targetListingId,
            )
          }
        >
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat with{" "}
          {otherUser?.fullName.split(" ")[0] ?? "student"}
        </Button>

        {isIncoming && swap.status === "pending" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-destructive hover:bg-destructive/10"
              onClick={() => onRespond(swap.id, "declined")}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Decline
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-primary"
              onClick={() => onRespond(swap.id, "accepted")}
            >
              <Check className="mr-1 h-3.5 w-3.5" /> Accept swap
            </Button>
          </div>
        )}

        {isIncoming && swap.status === "accepted" && (
          <Button
            size="sm"
            className="rounded-xl bg-success text-white hover:bg-success/90"
            onClick={() => onRespond(swap.id, "completed")}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark swap completed
          </Button>
        )}
      </div>
    </div>
  );
}

function SwapsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, data, requestSwap, respondToSwap, openConversation } = useApp();

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(Boolean(search.target));
  const [selectedTargetId, setSelectedTargetId] = useState<string>(search.target || "");
  const [selectedOfferedId, setSelectedOfferedId] = useState<string>("");
  const [swapNote, setSwapNote] = useState<string>(
    "Hi, I'm interested in swapping textbooks on campus!",
  );
  const [submitting, setSubmitting] = useState(false);

  // Available books to swap for: active listings where listingType is swap/both and not seller's own
  const availableTargetBooks = data.listings.filter(
    (l) => l.sellerId !== user?.id && l.status === "active" && l.listingType !== "sell",
  );

  // User's own books available to offer
  const myBooks = data.listings.filter((l) => l.sellerId === user?.id && l.status === "active");

  const incomingSwaps = data.swaps
    .filter((s) => s.toUserId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const sentSwaps = data.swaps
    .filter((s) => s.fromUserId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleRespond = async (swapId: string, status: SwapRequest["status"]) => {
    try {
      await respondToSwap(swapId, status);
      toast.success(`Swap request marked as ${status}`);
    } catch {
      toast.error("Failed to update swap request");
    }
  };

  const handleOpenChat = async (otherUserId: string, listingId?: string) => {
    try {
      const cid = await openConversation(otherUserId, listingId);
      navigate({ to: "/messages/$conversationId", params: { conversationId: cid } });
    } catch {
      toast.error("Could not start conversation");
    }
  };

  const handleSubmitSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId || !selectedOfferedId) {
      toast.error("Please select both textbooks for the swap.");
      return;
    }

    setSubmitting(true);
    try {
      await requestSwap({
        targetListingId: selectedTargetId,
        offeredListingId: selectedOfferedId,
        message: swapNote,
      });
      toast.success("Swap proposal sent to the seller!");
      setIsNewDialogOpen(false);
      setSelectedTargetId("");
      setSelectedOfferedId("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send swap request";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Textbook Swaps"
        subtitle="Save money by exchanging prescribed textbooks with classmates on campus."
        action={
          <Button className="rounded-xl" onClick={() => setIsNewDialogOpen(true)}>
            <Repeat2 className="mr-2 h-4 w-4" /> Propose a swap
          </Button>
        }
      />

      <Tabs defaultValue="incoming">
        <TabsList className="rounded-xl">
          <TabsTrigger value="incoming">Incoming requests ({incomingSwaps.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent requests ({sentSwaps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4 space-y-4">
          {incomingSwaps.length === 0 ? (
            <EmptyState
              title="No incoming swap requests"
              description="When another student wants to exchange one of your textbooks, their proposal will appear here."
              action={
                <Button asChild className="rounded-xl">
                  <Link to="/sell">List a textbook for swap</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {incomingSwaps.map((swap) => (
                <SwapCard
                  key={swap.id}
                  swap={swap}
                  isIncoming={true}
                  onRespond={handleRespond}
                  onOpenChat={handleOpenChat}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 space-y-4">
          {sentSwaps.length === 0 ? (
            <EmptyState
              title="No sent swap requests"
              description="Browse textbooks marked 'Swap' or 'Sell or Swap' to propose an exchange."
              action={
                <Button className="rounded-xl" onClick={() => setIsNewDialogOpen(true)}>
                  <Repeat2 className="mr-2 h-4 w-4" /> Propose a swap
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {sentSwaps.map((swap) => (
                <SwapCard
                  key={swap.id}
                  swap={swap}
                  isIncoming={false}
                  onRespond={handleRespond}
                  onOpenChat={handleOpenChat}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Propose Swap Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary-dark">
              Propose a Textbook Swap
            </DialogTitle>
            <DialogDescription>
              Choose the textbook you want and the one you offer in exchange. No real payment
              required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSwap} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="target-book" className="text-xs font-semibold text-muted-foreground">
                Textbook you want to receive:
              </Label>
              <Select value={selectedTargetId} onValueChange={(val) => setSelectedTargetId(val)}>
                <SelectTrigger id="target-book" className="mt-1.5 rounded-xl">
                  <SelectValue placeholder="Select a campus textbook..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {availableTargetBooks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title} — {b.campus} (Est. {rand(b.price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="offered-book" className="text-xs font-semibold text-muted-foreground">
                Your textbook to offer in exchange:
              </Label>
              {myBooks.length > 0 ? (
                <Select
                  value={selectedOfferedId}
                  onValueChange={(val) => setSelectedOfferedId(val)}
                >
                  <SelectTrigger id="offered-book" className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Select one of your listings..." />
                  </SelectTrigger>
                  <SelectContent>
                    {myBooks.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title} ({b.condition} · {rand(b.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1.5 rounded-xl border border-dashed border-border bg-secondary/50 p-3 text-center text-xs">
                  <p className="text-muted-foreground">You don't have any active listings yet.</p>
                  <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-primary">
                    <Link to="/sell">List a textbook first</Link>
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="swap-message" className="text-xs font-semibold text-muted-foreground">
                Message to the student:
              </Label>
              <Textarea
                id="swap-message"
                value={swapNote}
                onChange={(e) => setSwapNote(e.target.value)}
                placeholder="Suggest where to meet or details about your book's condition..."
                className="mt-1.5 min-h-[80px] rounded-xl"
                rows={3}
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsNewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={submitting || !selectedTargetId || !selectedOfferedId}
              >
                {submitting ? "Sending..." : "Send swap proposal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
