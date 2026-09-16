import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { repo } from "./repo";
import type {
  AppNotification,
  Cart,
  Conversation,
  Listing,
  NotificationPrefs,
  Order,
  Review,
  SignUpInput,
  Snapshot,
  SwapRequest,
  User,
} from "./types";
import { emptySnapshot } from "./types";

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export interface NewListingInput {
  title: string;
  author: string;
  edition: string;
  isbn: string;
  module: string;
  category: Listing["category"];
  condition: Listing["condition"];
  description: string;
  price: number;
  campus: string;
  listingType: Listing["listingType"];
  imageUrl?: string;
}

interface AppContextValue {
  ready: boolean;
  mode: "demo" | "firebase";
  user: User | null;
  data: Snapshot;
  refresh: () => Promise<void>;
  // auth
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  // lookups
  userById: (id: string) => User | undefined;
  listingById: (id: string) => Listing | undefined;
  sellerStats: (id: string) => {
    rating: number;
    reviewCount: number;
    active: number;
    sold: number;
    swapped: number;
  };
  cart: string[];
  unreadCount: number;
  // listings
  createListing: (input: NewListingInput) => Promise<Listing>;
  updateListing: (id: string, patch: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  // cart + orders
  addToCart: (listingId: string) => Promise<boolean>;
  removeFromCart: (listingId: string) => Promise<void>;
  placeOrder: (input: {
    fulfilment: Order["fulfilment"];
    note?: string;
    payment: string;
  }) => Promise<Order>;
  completeOrder: (orderId: string) => Promise<void>;
  // swaps
  requestSwap: (input: {
    targetListingId: string;
    offeredListingId: string;
    message: string;
  }) => Promise<void>;
  respondToSwap: (id: string, status: SwapRequest["status"]) => Promise<void>;
  // messages
  openConversation: (otherUserId: string, listingId?: string) => Promise<string>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  // notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  // profile + reviews
  updateProfile: (patch: Partial<User>) => Promise<void>;
  updatePrefs: (patch: Partial<NotificationPrefs>) => Promise<void>;
  addReview: (input: {
    sellerId: string;
    rating: number;
    comment: string;
    orderId?: string;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<Snapshot>(() => emptySnapshot());

  const load = useCallback(async () => {
    const snapshot = await repo.fetchAll();
    setData(snapshot);
    return snapshot;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [current, snapshot] = await Promise.all([repo.currentUser(), repo.fetchAll()]);
        if (cancelled) return;
        setUser(current);
        setData(snapshot);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const userById = useCallback((id: string) => data.users.find((u) => u.id === id), [data.users]);
  const listingById = useCallback(
    (id: string) => data.listings.find((l) => l.id === id),
    [data.listings],
  );

  const sellerStats = useCallback(
    (id: string) => {
      const reviews = data.reviews.filter((r) => r.sellerId === id);
      const listings = data.listings.filter((l) => l.sellerId === id);
      const rating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      return {
        rating,
        reviewCount: reviews.length,
        active: listings.filter((l) => l.status === "active").length,
        sold: listings.filter((l) => l.status === "sold").length,
        swapped: listings.filter((l) => l.status === "swapped").length,
      };
    },
    [data.reviews, data.listings],
  );

  const cart = useMemo(
    () => (user ? (data.carts.find((c) => c.userId === user.id)?.listingIds ?? []) : []),
    [data.carts, user],
  );

  const unreadCount = useMemo(
    () => (user ? data.notifications.filter((n) => n.userId === user.id && !n.read).length : 0),
    [data.notifications, user],
  );

  const notify = useCallback(async (input: Omit<AppNotification, "id" | "at" | "read">) => {
    const notification: AppNotification = {
      ...input,
      id: uid("n"),
      at: new Date().toISOString(),
      read: false,
    };
    await repo.put("notifications", notification);
  }, []);

  const saveCart = useCallback(
    async (listingIds: string[]) => {
      if (!user) return;
      const next: Cart = { userId: user.id, listingIds };
      await repo.put("carts", next);
      await load();
    },
    [user, load],
  );

  const value: AppContextValue = {
    ready,
    mode: repo.mode,
    user,
    data,
    refresh: async () => {
      await load();
    },
    userById,
    listingById,
    sellerStats,
    cart,
    unreadCount,

    signIn: async (email, password) => {
      const signedIn = await repo.signIn(email, password);
      setUser(signedIn);
      await load();
    },
    signUp: async (input) => {
      const created = await repo.signUp(input);
      setUser(created);
      await load();
    },
    signInDemo: async () => {
      const demo = await repo.signInDemo();
      setUser(demo);
      await load();
    },
    signOut: async () => {
      await repo.signOut();
      setUser(null);
      await load();
    },

    createListing: async (input) => {
      if (!user) throw new Error("Please sign in first.");
      const listing: Listing = {
        ...input,
        id: uid("l"),
        sellerId: user.id,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      await repo.put("listings", listing);
      await notify({
        userId: user.id,
        type: "listing",
        title: "Textbook published",
        body: `${listing.title} is now live on Browse.`,
        link: `/books/${listing.id}`,
      });
      await load();
      return listing;
    },
    updateListing: async (id, patch) => {
      const existing = listingById(id);
      if (!existing) throw new Error("Listing not found.");
      await repo.put("listings", { ...existing, ...patch });
      await load();
    },
    deleteListing: async (id) => {
      await repo.remove("listings", id);
      await load();
    },
    uploadImage: (file) => repo.uploadImage(file),

    addToCart: async (listingId) => {
      if (cart.includes(listingId)) return false;
      await saveCart([...cart, listingId]);
      return true;
    },
    removeFromCart: async (listingId) => {
      await saveCart(cart.filter((id) => id !== listingId));
    },

    placeOrder: async ({ fulfilment, note, payment }) => {
      if (!user) throw new Error("Please sign in first.");
      const listings = cart.map((id) => listingById(id)).filter((l): l is Listing => Boolean(l));
      if (!listings.length) throw new Error("Your cart is empty.");
      const nowIso = new Date().toISOString();
      const order: Order = {
        id: uid("o"),
        orderNumber: `SHT-${Math.floor(1000 + Math.random() * 8999)}`,
        buyerId: user.id,
        items: listings.map((l) => ({
          listingId: l.id,
          title: l.title,
          price: l.price,
          sellerId: l.sellerId,
          imageUrl: l.imageUrl,
        })),
        total: listings.reduce((sum, l) => sum + l.price, 0),
        fulfilment,
        note,
        payment,
        meetingDetails:
          fulfilment === "collection"
            ? `${listings[0].campus} — arrange a meeting spot with the seller`
            : "Campus delivery — the seller will confirm a drop-off time",
        status: "active",
        timeline: [
          { label: "Confirmed", at: nowIso, done: true },
          { label: "Arranging collection", done: false },
          { label: "Completed", done: false },
        ],
        createdAt: nowIso,
        reviewedSellerIds: [],
      };
      await repo.put("orders", order);
      for (const listing of listings) {
        await repo.put("listings", { ...listing, status: "sold" });
      }
      await notify({
        userId: user.id,
        type: "order",
        title: `Order ${order.orderNumber} confirmed`,
        body: `${listings.length} textbook${listings.length > 1 ? "s" : ""} · R${order.total}`,
        link: `/orders/${order.id}`,
      });
      await saveCart([]);
      await load();
      return order;
    },

    completeOrder: async (orderId) => {
      const order = data.orders.find((o) => o.id === orderId);
      if (!order) return;
      const nowIso = new Date().toISOString();
      await repo.put("orders", {
        ...order,
        status: "completed",
        timeline: order.timeline.map((step) => ({ ...step, done: true, at: step.at ?? nowIso })),
      });
      if (user) {
        await notify({
          userId: user.id,
          type: "order",
          title: `Order ${order.orderNumber} completed`,
          body: "Thanks! You can now review the seller.",
          link: `/orders/${order.id}`,
        });
      }
      await load();
    },

    requestSwap: async ({ targetListingId, offeredListingId, message }) => {
      if (!user) throw new Error("Please sign in first.");
      const target = listingById(targetListingId);
      if (!target) throw new Error("Listing not found.");
      const request: SwapRequest = {
        id: uid("s"),
        fromUserId: user.id,
        toUserId: target.sellerId,
        targetListingId,
        offeredListingId,
        message,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await repo.put("swaps", request);
      await notify({
        userId: target.sellerId,
        type: "swap",
        title: "New swap request",
        body: `${user.fullName} wants to swap for ${target.title}.`,
        link: "/swaps",
      });
      await load();
    },

    respondToSwap: async (id, status) => {
      const request = data.swaps.find((s) => s.id === id);
      if (!request) return;
      await repo.put("swaps", { ...request, status });
      if (status === "completed") {
        for (const listingId of [request.targetListingId, request.offeredListingId]) {
          const listing = listingById(listingId);
          if (listing) await repo.put("listings", { ...listing, status: "swapped" });
        }
      }
      await notify({
        userId: request.fromUserId,
        type: "swap",
        title: `Swap request ${status}`,
        body: `Your swap request was ${status}.`,
        link: "/swaps",
      });
      await load();
    },

    openConversation: async (otherUserId, listingId) => {
      if (!user) throw new Error("Please sign in first.");
      const existing = data.conversations.find(
        (c) =>
          c.participantIds.includes(user.id) &&
          c.participantIds.includes(otherUserId) &&
          (listingId ? c.listingId === listingId : true),
      );
      if (existing) return existing.id;
      const conversation: Conversation = {
        id: uid("c"),
        participantIds: [user.id, otherUserId],
        listingId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      await repo.put("conversations", conversation);
      await load();
      return conversation.id;
    },

    sendMessage: async (conversationId, text) => {
      if (!user) throw new Error("Please sign in first.");
      const conversation = data.conversations.find((c) => c.id === conversationId);
      if (!conversation) return;
      const nowIso = new Date().toISOString();
      const updated: Conversation = {
        ...conversation,
        updatedAt: nowIso,
        messages: [...conversation.messages, { id: uid("m"), senderId: user.id, text, at: nowIso }],
      };
      await repo.put("conversations", updated);
      const other = conversation.participantIds.find((id) => id !== user.id);
      if (other) {
        await notify({
          userId: other,
          type: "message",
          title: `New message from ${user.fullName}`,
          body: text.slice(0, 90),
          link: `/messages/${conversation.id}`,
        });
      }
      await load();
    },

    markNotificationRead: async (id) => {
      const notification = data.notifications.find((n) => n.id === id);
      if (!notification || notification.read) return;
      await repo.put("notifications", { ...notification, read: true });
      await load();
    },
    markAllNotificationsRead: async () => {
      if (!user) return;
      for (const notification of data.notifications.filter(
        (n) => n.userId === user.id && !n.read,
      )) {
        await repo.put("notifications", { ...notification, read: true });
      }
      await load();
    },

    updateProfile: async (patch) => {
      if (!user) return;
      const updated = { ...user, ...patch };
      await repo.put("users", updated);
      setUser(updated);
      await load();
    },
    updatePrefs: async (patch) => {
      if (!user) return;
      const updated = { ...user, notificationPrefs: { ...user.notificationPrefs, ...patch } };
      await repo.put("users", updated);
      setUser(updated);
      await load();
    },

    addReview: async ({ sellerId, rating, comment, orderId }) => {
      if (!user) throw new Error("Please sign in first.");
      const review: Review = {
        id: uid("r"),
        sellerId,
        authorId: user.id,
        authorName: user.fullName,
        rating,
        comment,
        at: new Date().toISOString(),
        orderId,
      };
      await repo.put("reviews", review);
      if (orderId) {
        const order = data.orders.find((o) => o.id === orderId);
        if (order) {
          await repo.put("orders", {
            ...order,
            reviewedSellerIds: [...(order.reviewedSellerIds ?? []), sellerId],
          });
        }
      }
      await load();
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppDataProvider");
  return ctx;
}
