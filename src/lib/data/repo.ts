import { firebaseRepo } from "./firebaseRepo";
import type { Repo } from "./types";

// Production data is always backed by Firebase. Missing Firebase configuration
// is surfaced as an actionable error instead of silently switching to localStorage.
export const repo: Repo = firebaseRepo;
