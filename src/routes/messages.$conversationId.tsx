import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Send, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState } from "@/components/app-shell";
import { rand } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/data/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages/$conversationId")({
  head: () => ({
    meta: [
      { title: "Chat — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Chat directly with a student seller or buyer to arrange a textbook meetup.",
      },
      { property: "og:title", content: "Chat — SecondHand Textbook Swap" },
    ],
  }),
  component: () => (
    <AppShell>
      <ConversationChatPage />
    </AppShell>
  ),
});

function ConversationChatPage() {
  const { conversationId } = Route.useParams();
  const { user, data, userById, listingById, sendMessage } = useApp();
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = data.conversations.find((c) => c.id === conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages.length]);

  if (!conversation) {
    return (
      <EmptyState
        title="Conversation not found"
        description="This chat may have been deleted or the link is expired."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/messages">Back to messages</Link>
          </Button>
        }
      />
    );
  }

  const otherId = conversation.participantIds.find((id) => id !== user?.id) ?? "";
  const otherUser = userById(otherId);
  const listing = conversation.listingId ? listingById(conversation.listingId) : undefined;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await sendMessage(conversation.id, text);
      setInputText("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[500px] flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
            <Link to="/messages" aria-label="Back to messages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary-dark font-bold text-xs">
            {otherUser?.fullName
              ? otherUser.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "ST"}
          </div>

          <div>
            <h2 className="text-sm font-semibold leading-none text-primary-dark">
              {otherUser?.fullName ?? "Fellow Student"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {otherUser?.campus ?? "Campus"} · {otherUser?.institution ?? "University"}
            </p>
          </div>
        </div>

        {listing && (
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex rounded-xl">
            <Link to="/books/$id" params={{ id: listing.id }}>
              <BookOpen className="mr-1.5 h-3.5 w-3.5" /> View Textbook
            </Link>
          </Button>
        )}
      </div>

      {/* Linked Listing Mini Banner */}
      {listing && (
        <div className="flex items-center justify-between border-b border-border/70 bg-secondary/30 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-primary-dark">Regarding:</span>
            <span className="truncate text-foreground font-medium">{listing.title}</span>
            <span className="font-semibold text-primary shrink-0">{rand(listing.price)}</span>
          </div>
          <Link
            to="/books/$id"
            params={{ id: listing.id }}
            className="text-primary hover:underline font-medium text-xs sm:hidden shrink-0 ml-2"
          >
            View
          </Link>
        </div>
      )}

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-xs text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-sm">Start your conversation</p>
              <p className="mt-1">
                Say hello, ask questions about the textbook, or agree on a safe meetup spot on
                campus.
              </p>
            </div>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs break-words",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-secondary text-foreground rounded-bl-xs border border-border/50",
                  )}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                  {new Date(msg.at).toLocaleTimeString("en-ZA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border bg-card p-3"
      >
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message (e.g. Can we meet at the campus library?)..."
          className="flex-1 rounded-xl"
          disabled={sending}
        />
        <Button type="submit" disabled={!inputText.trim() || sending} className="rounded-xl px-4">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
