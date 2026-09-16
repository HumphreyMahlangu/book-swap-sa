import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, BookOpen, CheckCheck, MessageSquare, Repeat2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";
import type { AppNotification } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — SecondHand Textbook Swap" },
      {
        name: "description",
        content: "Stay updated with swap requests, textbook orders, and chat messages.",
      },
      { property: "og:title", content: "Notifications — SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Campus textbook marketplace notifications and alerts.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <NotificationsPage />
    </AppShell>
  ),
});

const TYPE_ICONS: Record<AppNotification["type"], typeof Bell> = {
  swap: Repeat2,
  order: ShoppingBag,
  message: MessageSquare,
  listing: BookOpen,
};

const TYPE_COLORS: Record<AppNotification["type"], string> = {
  swap: "bg-accent/15 text-accent",
  order: "bg-primary/15 text-primary",
  message: "bg-emerald-500/15 text-emerald-600",
  listing: "bg-amber-500/15 text-amber-600",
};

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

function NotificationsPage() {
  const { user, data, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread" | AppNotification["type"]>("all");

  const myNotifications = data.notifications
    .filter((n) => n.userId === user?.id)
    .sort((a, b) => b.at.localeCompare(a.at));

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const filtered = myNotifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "All caught up with your campus alerts"
        }
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={async () => {
                await markAllNotificationsRead();
                toast.success("All notifications marked as read");
              }}
            >
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Filter Chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "all", label: `All (${myNotifications.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          {
            key: "swap",
            label: `Swaps (${myNotifications.filter((n) => n.type === "swap").length})`,
          },
          {
            key: "order",
            label: `Orders (${myNotifications.filter((n) => n.type === "order").length})`,
          },
          {
            key: "message",
            label: `Messages (${myNotifications.filter((n) => n.type === "message").length})`,
          },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key as "all" | "unread" | AppNotification["type"])}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              filter === item.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={filter === "unread" ? "No unread notifications" : "No notifications"}
          description={
            filter === "unread"
              ? "You've read all your notifications."
              : "When someone requests a swap, sends a message, or orders your textbook, you'll see alerts here."
          }
          action={
            <Button asChild className="rounded-xl">
              <Link to="/browse">Browse textbooks</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Bell;
            const colorClass = TYPE_COLORS[item.type] || "bg-secondary text-primary-dark";

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleNotificationClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNotificationClick(item);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition text-left",
                  item.read
                    ? "border-border bg-card/60 hover:bg-card hover:shadow-xs"
                    : "border-primary/30 bg-primary/5 shadow-xs hover:bg-primary/10",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    colorClass,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={cn(
                        "text-sm",
                        item.read
                          ? "font-medium text-foreground"
                          : "font-semibold text-primary-dark",
                      )}
                    >
                      {item.title}
                    </h3>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTimeAgo(item.at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                </div>

                {!item.read && (
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                    aria-label="Unread"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
