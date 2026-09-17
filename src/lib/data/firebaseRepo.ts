import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { getDb, getFirebaseAuth } from "../firebase";
import type {
  AppNotification,
  Cart,
  CollectionName,
  Conversation,
  Listing,
  Order,
  Repo,
  Review,
  SignUpInput,
  SwapRequest,
  User,
} from "./types";
import { emptySnapshot } from "./types";

const docId = (collectionName: CollectionName, item: Record<string, unknown>) =>
  collectionName === "carts" ? (item["userId"] as string) : (item["id"] as string);

const records = <T>(snapshot: QuerySnapshot<DocumentData>): T[] =>
  snapshot.docs.map((item) => item.data() as T);

const uniqueById = <T extends { id: string }>(items: T[]): T[] =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());

async function waitForFirebaseUser(): Promise<import("firebase/auth").User | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;
  return await new Promise<import("firebase/auth").User | null>((resolve) => {
    const unsub = auth.onAuthStateChanged((u) => {
      unsub();
      resolve(u);
    });
  });
}

async function waitForAuth(): Promise<User | null> {
  const fbUser = await waitForFirebaseUser();
  if (!fbUser) return null;
  const snap = await getDoc(doc(getDb(), "users", fbUser.uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export const firebaseRepo: Repo = {
  mode: "firebase",

  currentUser: waitForAuth,

  async signUp(input: SignUpInput) {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      input.email.trim(),
      input.password,
    );
    const user: User = {
      id: cred.user.uid,
      fullName: input.fullName.trim(),
      studentNumber: input.studentNumber.trim(),
      email: input.email.trim().toLowerCase(),
      institution: input.institution.trim(),
      campus: input.campus,
      memberSince: new Date().toISOString(),
      notificationPrefs: { orders: true, messages: true, swaps: true, marketing: false },
    };
    await setDoc(doc(getDb(), "users", user.id), user);
    await setDoc(doc(getDb(), "carts", user.id), { userId: user.id, listingIds: [] });
    return user;
  },

  async signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    const snap = await getDoc(doc(getDb(), "users", cred.user.uid));
    if (!snap.exists()) throw new Error("We could not find your student profile.");
    return snap.data() as User;
  },

  async signOut() {
    await fbSignOut(getFirebaseAuth());
  },

  async fetchAll() {
    const db = getDb();
    const snapshot = emptySnapshot();

    // Marketplace listings and reviews are public. Private collections are
    // queried only after Firebase Authentication has restored a user session.
    const [activeListings, reviews] = await Promise.all([
      getDocs(query(collection(db, "listings"), where("status", "==", "active"))),
      getDocs(collection(db, "reviews")),
    ]);
    snapshot.listings = records<Listing>(activeListings);
    snapshot.reviews = records<Review>(reviews);

    const authUser = await waitForFirebaseUser();
    if (!authUser) return snapshot;

    const uid = authUser.uid;
    const [
      users,
      ownListings,
      orders,
      sentSwaps,
      receivedSwaps,
      conversations,
      notifications,
      cart,
    ] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(query(collection(db, "listings"), where("sellerId", "==", uid))),
      getDocs(query(collection(db, "orders"), where("buyerId", "==", uid))),
      getDocs(query(collection(db, "swaps"), where("fromUserId", "==", uid))),
      getDocs(query(collection(db, "swaps"), where("toUserId", "==", uid))),
      getDocs(query(collection(db, "conversations"), where("participantIds", "array-contains", uid))),
      getDocs(query(collection(db, "notifications"), where("userId", "==", uid))),
      getDoc(doc(db, "carts", uid)),
    ]);

    snapshot.users = records<User>(users);
    snapshot.listings = uniqueById([
      ...snapshot.listings,
      ...records<Listing>(ownListings),
    ]);
    snapshot.orders = records<Order>(orders);
    snapshot.swaps = uniqueById([
      ...records<SwapRequest>(sentSwaps),
      ...records<SwapRequest>(receivedSwaps),
    ]);
    snapshot.conversations = records<Conversation>(conversations);
    snapshot.notifications = records<AppNotification>(notifications);
    snapshot.carts = cart.exists() ? [cart.data() as Cart] : [];

    return snapshot;
  },

  async put(collectionName, item) {
    const id = docId(collectionName, item as unknown as Record<string, unknown>);
    await setDoc(
      doc(getDb(), collectionName, id),
      item as unknown as Record<string, unknown>,
    );
  },

  async remove(collectionName, id) {
    await deleteDoc(doc(getDb(), collectionName, id));
  },
};
