/**
 * NextAuth.js API Route Handler
 * 
 * This route handles all authentication requests:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/signout
 * - GET /api/auth/session
 * - GET /api/auth/providers
 * - etc.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;

