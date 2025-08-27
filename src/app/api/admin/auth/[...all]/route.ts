import { toNextJsHandler } from "better-auth/next-js";
import { adminAuth } from "@/lib/auth/auth-config";

export const { POST, GET } = toNextJsHandler(adminAuth);
