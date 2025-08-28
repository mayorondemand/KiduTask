import { toNextJsHandler } from "better-auth/next-js";
import { adminAuthConfig } from "@/lib/auth/auth-config";

export const { POST, GET } = toNextJsHandler(adminAuthConfig);
