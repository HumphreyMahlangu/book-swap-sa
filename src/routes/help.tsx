import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  MapPin,
  MessageSquare,
  Repeat2,
  ShieldCheck,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Campus Safety — SecondHand Textbook Swap" },
      {
        name: "description",
        content:
          "Frequently asked questions and safety guidelines for university textbook exchanges.",
      },
      { property: "og:title", content: "Help & Campus Safety — SecondHand Textbook Swap" },
    ],
  }),
  component: () => (
    <AppShell>
      <HelpPage />
    </AppShell>
  ),
});

function HelpPage() {
  return (
    <>
      <PageHeader
        title="Help & Campus Safety Guide"
        subtitle="Everything you need to know about buying, selling, and swapping textbooks safely."
      />

      {/* Safety Tips Banner */}
      <div className="mb-6 rounded-2xl border border-border bg-primary/5 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-primary-dark">Safe Campus Meetup Guidelines</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Book Swap SA connects students on the same or nearby campuses. Follow these
          recommendations for every in-person textbook handover:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-border/70 bg-card p-3">
            <span className="font-semibold text-primary-dark flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" /> Public Campus Spots
            </span>
            <p className="mt-1 text-muted-foreground">
              Always arrange meetups during daylight hours in well-lit, public areas such as the
              campus library, cafeteria, or student union.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3">
            <span className="font-semibold text-primary-dark flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" /> Inspect Condition
            </span>
            <p className="mt-1 text-muted-foreground">
              Examine the textbook before finalizing: check the ISBN edition, verify chapters, and
              check for excessive highlighting or missing pages.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3">
            <span className="font-semibold text-primary-dark flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-emerald-600" /> Keep Chats in App
            </span>
            <p className="mt-1 text-muted-foreground">
              Use our built-in campus messaging so both parties have a clear record of agreed times,
              price, and handover location.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold text-primary-dark mb-4">Frequently Asked Questions</h3>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-semibold text-left">
              How does textbook swapping work?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Swapping lets you trade a textbook from a completed course directly for one you need
              this semester. Browse listings marked "Swap" or "Sell or Swap", select "Request swap",
              and pick which of your own active listings you want to offer in exchange. The seller
              receives an alert and can accept or decline.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm font-semibold text-left">
              Does Book Swap SA charge transaction fees?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              No! Book Swap SA is designed for students by students. There are zero listing fees and
              zero commission cuts on student textbook exchanges.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm font-semibold text-left">
              How does checkout and payment work in demo mode?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              This presentation build operates in a safe simulated demo mode. All checkouts, orders,
              chat messages, and swap proposals persist locally in your browser so you can test and
              demonstrate the full user journey without real banking details.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-sm font-semibold text-left">
              How do I leave a review for a seller?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Once an order has been fulfilled or marked completed, head to your "My Orders" tab and
              open the order details. You can rate the seller with 1–5 stars and leave written
              feedback to help the campus community.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-sm font-semibold text-left">
              What if a book is already sold?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Sellers can mark their listings as "Sold" or "Swapped" at any time from the "My
              Listings" screen. This immediately updates the marketplace so other students know it's
              no longer available.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild className="rounded-xl">
          <Link to="/browse">Explore Campus Textbooks</Link>
        </Button>
      </div>
    </>
  );
}
