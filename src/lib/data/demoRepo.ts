import { buildSeed, DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } from "./seed";
import type { CollectionName, Repo, Snapshot, SignUpInput, User } from "./types";

const DB_KEY = "sht.db.v1";
const SESSION_KEY = "sht.session.v1";
const CRED_KEY = "sht.credentials.v1";

type Creds = Record<string, string>;

function readDb(): Snapshot {
  if (typeof localStorage === "undefined") return buildSeed();
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seed = buildSeed();
    localStorage.setItem(DB_KEY, JSON.stringify(seed));
    localStorage.setItem(CRED_KEY, JSON.stringify({ [DEMO_EMAIL]: DEMO_PASSWORD }));
    return seed;
  }
  try {
    return { ...buildSeed(), ...(JSON.parse(raw) as Snapshot) };
  } catch {
    const seed = buildSeed();
    localStorage.setItem(DB_KEY, JSON.stringify(seed));
    return seed;
  }
}

function writeDb(db: Snapshot) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function readCreds(): Creds {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CRED_KEY) ?? "{}") as Creds;
  } catch {
    return {};
  }
}

const keyOf = (collection: CollectionName, item: Record<string, unknown>) =>
  collection === "carts" ? (item["userId"] as string) : (item["id"] as string);

export const demoRepo: Repo = {
  mode: "demo",

  async currentUser() {
    if (typeof localStorage === "undefined") return null;
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return readDb().users.find((u) => u.id === id) ?? null;
  },

  async signUp(input: SignUpInput) {
    const db = readDb();
    const email = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error("An account with that student email already exists.");
    }
    const user: User = {
      id: `u-${Date.now()}`,
      fullName: input.fullName.trim(),
      studentNumber: input.studentNumber.trim(),
      email,
      institution: input.institution.trim(),
      campus: input.campus,
      memberSince: new Date().toISOString(),
      notificationPrefs: { orders: true, messages: true, swaps: true, marketing: false },
    };
    db.users.push(user);
    db.carts.push({ userId: user.id, listingIds: [] });
    writeDb(db);
    const creds = readCreds();
    creds[email] = input.password;
    localStorage.setItem(CRED_KEY, JSON.stringify(creds));
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  },

  async signIn(email: string, password: string) {
    const db = readDb();
    const normalised = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normalised);
    const creds = readCreds();
    if (!user) throw new Error("No account found with that student email.");
    const expected = creds[normalised] ?? (normalised === DEMO_EMAIL ? DEMO_PASSWORD : undefined);
    if (!expected || expected !== password)
      throw new Error("Incorrect password. Please try again.");
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  },

  async signInDemo() {
    readDb();
    localStorage.setItem(SESSION_KEY, DEMO_USER_ID);
    const user = readDb().users.find((u) => u.id === DEMO_USER_ID)!;
    return user;
  },

  async signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  async fetchAll() {
    return readDb();
  },

  async put(collection, item) {
    const db = readDb();
    const list = db[collection] as Record<string, unknown>[];
    const id = keyOf(collection, item as unknown as Record<string, unknown>);
    const index = list.findIndex((existing) => keyOf(collection, existing) === id);
    if (index >= 0) list[index] = item as unknown as Record<string, unknown>;
    else list.push(item as unknown as Record<string, unknown>);
    writeDb(db);
  },

  async remove(collection, id) {
    const db = readDb();
    const list = db[collection] as Record<string, unknown>[];
    db[collection] = list.filter((existing) => keyOf(collection, existing) !== id) as never;
    writeDb(db);
  },

  async uploadImage(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read that image."));
      reader.readAsDataURL(file);
    });
  },
};

export function resetDemoData() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(CRED_KEY);
  readDb();
}
