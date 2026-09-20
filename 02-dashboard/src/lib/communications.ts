export type CommSnippet = {
  content: string;
  message_type: string;
  channel: string;
  delivery_status?: string;
  created_at?: string;
};

const CHANNEL_RANK: Record<string, number> = {
  email: 0,
  whatsapp: 1,
  system: 2,
  sales_alert: 9,
};

/**
 * Prefer customer-facing confirmation (email/whatsapp) over sales_alert.
 */
export function pickCustomerConfirmation(
  rows: CommSnippet[] | null | undefined,
): CommSnippet | null {
  if (!rows?.length) return null;
  const confirmations = rows.filter((r) => r.message_type === "confirmation");
  const pool = confirmations.length ? confirmations : rows;
  const sorted = [...pool].sort(
    (a, b) => (CHANNEL_RANK[a.channel] ?? 5) - (CHANNEL_RANK[b.channel] ?? 5),
  );
  return sorted[0] ?? null;
}

export function truncate(text: string | null | undefined, max = 120): string {
  if (!text) return "—";
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
