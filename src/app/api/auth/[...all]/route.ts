import { toNextJsHandler } from "better-auth/next-js";
import { publicAuthConfig } from "@/lib/auth/auth-config";

export const { POST, GET } = toNextJsHandler(publicAuthConfig);
