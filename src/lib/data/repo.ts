import { isFirebaseConfigured } from "../firebase";
import { demoRepo } from "./demoRepo";
import { firebaseRepo } from "./firebaseRepo";
import type { Repo } from "./types";

export const repo: Repo = isFirebaseConfigured ? firebaseRepo : demoRepo;
export const isDemoMode = repo.mode === "demo";
