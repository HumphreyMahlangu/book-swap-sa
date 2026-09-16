import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const env = import.meta.env as Record<string, string | undefined>;

export const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"],
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: env["VITE_FIREBASE_APP_ID"],
};

/** True only when every required Firebase variable is present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured. The app is running in demo mode.");
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig as Required<typeof firebaseConfig>);
  }
  return app;
}

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());
export const getDb = (): Firestore => getFirestore(getFirebaseApp());
export const getBucket = (): FirebaseStorage => getStorage(getFirebaseApp());
