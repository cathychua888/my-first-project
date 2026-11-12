/**
 * Pricing shown on the landing page.
 * This file only DISPLAYS prices. It does not process payments.
 * Payment processing must be connected separately (see src/lib/access and README).
 */
export const PRICING = {
  currency: "PHP",
  symbol: "₱",
  foundingPrice: 299,
  regularPrice: 499,
  foundingLabel: "Founding User Offer",
  regularLabel: "Regular Price",
} as const;

export function formatPeso(amount: number): string {
  return `${PRICING.symbol}${amount.toLocaleString("en-PH")}`;
}
