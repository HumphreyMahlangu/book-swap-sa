export type Condition = "New" | "Like new" | "Good" | "Fair" | "Worn";
export type ListingType = "sell" | "swap" | "both";
export type ListingStatus = "active" | "sold" | "swapped";

export type Category =
  | "Information Technology"
  | "Business"
  | "Accounting"
  | "Engineering"
  | "Mathematics"
  | "Communication";

export const CATEGORIES: Category[] = [
  "Information Technology",
  "Business",
  "Accounting",
  "Engineering",
  "Mathematics",
  "Communication",
];

export const CONDITIONS: Condition[] = ["New", "Like new", "Good", "Fair", "Worn"];

export const CAMPUSES = [
  "Cape Town Campus",
  "Bellville Campus",
  "District Six Campus",
  "Mowbray Campus",
  "Wellington Campus",
  "Granger Bay Campus",
];

export interface NotificationPrefs {
  orders: boolean;
  messages: boolean;
  swaps: boolean;
  marketing: boolean;
}

export interface User {
  id: string;
  fullName: string;
  studentNumber: string;
  email: string;
  institution: string;
  campus: string;
  avatarUrl?: string;
  bio?: string;
  memberSince: string;
  notificationPrefs: NotificationPrefs;
}

export interface Listing {
  id: string;
  title: string;
  author: string;
  edition: string;
  isbn: string;
  module: string;
  category: Category;
  condition: Condition;
  description: string;
  price: number;
  campus: string;
  listingType: ListingType;
  imageUrl?: string;
  sellerId: string;
  status: ListingStatus;
  createdAt: string;
}

export interface OrderItem {
  listingId: string;
  title: string;
  price: number;
  sellerId: string;
  imageUrl?: string;
}

export interface TimelineStep {
  label: string;
  at?: string;
  done: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  items: OrderItem[];
  total: number;
  fulfilment: "collection" | "delivery";
  note?: string;
  payment: string;
  meetingDetails: string;
  status: "active" | "completed" | "cancelled";
  timeline: TimelineStep[];
  createdAt: string;
  reviewedSellerIds?: string[];
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  targetListingId: string;
  offeredListingId: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  at: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  listingId?: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export type NotificationType = "order" | "message" | "listing" | "swap";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  at: string;
  link?: string;
}

export interface Review {
  id: string;
  sellerId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  at: string;
  orderId?: string;
}

export interface Cart {
  userId: string;
  listingIds: string[];
}

export interface Snapshot {
  users: User[];
  listings: Listing[];
  orders: Order[];
  swaps: SwapRequest[];
  conversations: Conversation[];
  notifications: AppNotification[];
  reviews: Review[];
  carts: Cart[];
}

export type CollectionName = keyof Snapshot;

export interface SignUpInput {
  fullName: string;
  studentNumber: string;
  email: string;
  institution: string;
  campus: string;
  password: string;
}

export interface Repo {
  mode: "demo" | "firebase";
  currentUser(): Promise<User | null>;
  signUp(input: SignUpInput): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signInDemo(): Promise<User>;
  signOut(): Promise<void>;
  fetchAll(): Promise<Snapshot>;
  put<K extends CollectionName>(collection: K, item: Snapshot[K][number]): Promise<void>;
  remove(collection: CollectionName, id: string): Promise<void>;
  uploadImage(file: File): Promise<string>;
}

export const emptySnapshot = (): Snapshot => ({
  users: [],
  listings: [],
  orders: [],
  swaps: [],
  conversations: [],
  notifications: [],
  reviews: [],
  carts: [],
});
