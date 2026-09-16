import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { getBucket, getDb, getFirebaseAuth } from "../firebase";
import type { CollectionName, Repo, Snapshot, SignUpInput, User } from "./types";
import { emptySnapshot } from "./types";

const COLLECTIONS: CollectionName[] = [
  "users",
  "listings",
  "orders",
  "swaps",
  "conversations",
  "notifications",
  "reviews",
  "carts",
];

const docId = (collectionName: CollectionName, item: Record<string, unknown>) =>
  collectionName === "carts" ? (item["userId"] as string) : (item["id"] as string);

async function waitForAuth(): Promise<User | null> {
  const auth = getFirebaseAuth();
  const fbUser = await new Promise<import("firebase/auth").User | null>((resolve) => {
    const unsub = auth.onAuthStateChanged((u) => {
      unsub();
      resolve(u);
    });
  });
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

  async signInDemo() {
    throw new Error("Demo sign-in is only available when Firebase is not configured.");
  },

  async signOut() {
    await fbSignOut(getFirebaseAuth());
  },

  async fetchAll() {
    const db = getDb();
    const snapshot = emptySnapshot();
    await Promise.all(
      COLLECTIONS.map(async (name) => {
        try {
          const docs = await getDocs(collection(db, name));
          snapshot[name] = docs.docs.map((d) => d.data()) as never;
        } catch {
          snapshot[name] = [] as never;
        }
      }),
    );
    return snapshot as Snapshot;
  },

  async put(collectionName, item) {
    const id = docId(collectionName, item as unknown as Record<string, unknown>);
    await setDoc(doc(getDb(), collectionName, id), item as Record<string, unknown>);
  },

  async remove(collectionName, id) {
    await deleteDoc(doc(getDb(), collectionName, id));
  },

  async uploadImage(file: File) {
    const path = `images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
    const storageRef = ref(getBucket(), path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },
};
