import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * PAID ACCESS — prepared, but OFF by default.
 *
 * This module is intentionally separate from the AI code. The AI route only asks
 * one question: "does this visitor have access?" How access is granted
 * (PayMongo, Xendit, Stripe, manual GCash verification...) is decided later.
 *
 * Environment variables:
 *   PAYWALL_ENABLED=true        turn the paywall on (default: off, everyone can use the tools)
 *   ACCESS_TOKEN_SECRET=...     long random string used to sign access tokens
 *
 * How it will work once a payment provider is connected:
 *   1. The provider confirms a payment by calling /api/payments/webhook.
 *   2. The webhook VERIFIES the provider's signature (never trust the browser).
 *   3. Only then it calls createAccessToken() and gives the buyer a signed token
 *      (e.g. by email link that sets the "vacl_access" cookie).
 *   4. The AI route checks the cookie with hasAccess().
 *
 * Nothing in this app marks a payment as complete without verification.
 */

export const ACCESS_COOKIE = "vacl_access";

export function paywallEnabled(): boolean {
  return process.env.PAYWALL_ENABLED === "true";
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Creates a signed token. Call this ONLY after a payment has been verified server-side. */
export function createAccessToken(customerId: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: customerId, iat: Date.now() }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAccessToken(token: string | undefined, secret: string): boolean {
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export function hasAccess(request: Request): boolean {
  if (!paywallEnabled()) return true;
  const secret = process.env.ACCESS_TOKEN_SECRET ?? "";
  return verifyAccessToken(readCookie(request, ACCESS_COOKIE), secret);
}
