import {
  createFileRoute,
  Link,
  Outlet,
  useChildMatches,
  useNavigate,
} from "@tanstack/react-router";
import { BookOpen, MessageSquare, Search, Send, User as UserIcon } from "lucide-react";
import { useState } from "react";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/data/store";
import type { Conversation } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Chat with fellow students to arrange textbook collections, prices, and swaps.",
      },
      { property: "og:title", content: "Messages — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Student-to-student messaging for campus textbook arrangements.",
      },
    ],
  }),
  component: function MessagesRouteComponent() {
    const childMatches = useChildMatches();
    if (childMatches.length > 0) {
      return <Outlet />;
    }
    return (
      <AppShell>
        <MessagesInboxPage />
      </AppShell>
    );
  },
});

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function MessagesInboxPage() {
  const { user, data, userById, listingById } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const myConversations = data.conversations
    .filter((c) => c.participantIds.includes(user?.id ?? ""))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const filtered = myConversations.filter((c) => {
    const otherId = c.participantIds.find((id) => id !== user?.id) ?? "";
    const otherUser = userById(otherId);
    const listing = c.listingId ? listingById(c.listingId) : undefined;
    const nameMatch = otherUser?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const titleMatch = listing?.title.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    return !searchTerm || nameMatch || titleMatch;
  });

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Chat with student buyers and sellers across campuses."
      />

      {myConversations.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations by student name or book title..."
            className="pl-9 rounded-xl"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No conversations match your search" : "No messages yet"}
          description={
            searchTerm
              ? "Try searching for a different name or textbook."
              : "When you contact a seller or a student asks about your book, your chats will appear here."
          }
          action={
            <Button asChild className="rounded-xl">
              <Link to="/browse">Browse textbooks</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => {
            const otherId = conv.participantIds.find((id) => id !== user?.id) ?? "";
            const otherUser = userById(otherId);
            const listing = conv.listingId ? listingById(conv.listingId) : undefined;
            const lastMessage = conv.messages[conv.messages.length - 1];

            return (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate({
                    to: "/messages/$conversationId",
                    params: { conversationId: conv.id },
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate({
                      to: "/messages/$conversationId",
                      params: { conversationId: conv.id },
                    });
                  }
                }}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 transition text-left hover:border-primary/40 hover:shadow-xs"
              >
                {/* Avatar */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary-dark font-bold text-sm">
                  {otherUser?.fullName
                    ? otherUser.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "ST"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-primary-dark">
                      {otherUser?.fullName ?? "Fellow Student"}
                    </h3>
                    {lastMessage && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTime(lastMessage.at)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {otherUser?.campus ?? "Campus"} · {otherUser?.institution ?? "University"}
                  </p>

                  {listing && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-primary font-medium">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{listing.title}</span>
                    </div>
                  )}

                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {lastMessage
                      ? `${lastMessage.senderId === user?.id ? "You: " : ""}${lastMessage.text}`
                      : "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
