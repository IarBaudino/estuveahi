import { z } from "zod";

/** UID de Firebase Auth — no es UUID. */
export const firebaseUserIdSchema = z.string().min(1).max(128);
