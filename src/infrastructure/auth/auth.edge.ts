import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/** Auth solo para middleware (Edge) — sin Firebase. */
export const { auth: edgeAuth } = NextAuth(authConfig);
