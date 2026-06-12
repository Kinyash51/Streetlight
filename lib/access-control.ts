import { pricing } from "@/lib/pricing";
import { createSupabaseServerClient } from "@/lib/supabase";

export interface ReaderAccess {
  userId: string | null;
  tier: "free" | "ebook" | "supporter" | "patron" | null;
  status: "active" | "past_due" | "canceled" | "trialing" | null;
  canReadChapterOne: boolean;
  canReadFullBook: boolean;
  canReadEarlyChapters: boolean;
  canAccessSupporterNotes: boolean;
  canAccessPatronExtras: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export async function getReaderAccess(
  userId?: string | null
): Promise<ReaderAccess> {
  if (!userId) {
    return {
      userId: null,
      tier: "free",
      status: null,
      canReadChapterOne: true,
      canReadFullBook: false,
      canReadEarlyChapters: false,
      canAccessSupporterNotes: false,
      canAccessPatronExtras: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: subscription }, { data: orders }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("tier, status, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("product, status")
      .eq("user_id", userId)
      .eq("product", pricing.ebook.productCode)
      .eq("status", "paid"),
  ]);

  const tier = subscription?.tier as "supporter" | "patron" | null;
  const status = subscription?.status as ReaderAccess["status"];
  const hasEbook = Boolean(orders?.length);
  const isActive = status === "active" || status === "trialing";
  const isSupporterOrHigher =
    isActive && (tier === pricing.supporter.productCode || tier === pricing.patron.productCode);
  const isPatron = isActive && tier === pricing.patron.productCode;

  return {
    userId,
    tier: tier || (hasEbook ? "ebook" : "free"),
    status: status || null,
    canReadChapterOne: true,
    canReadFullBook: hasEbook || isSupporterOrHigher,
    canReadEarlyChapters: isSupporterOrHigher,
    canAccessSupporterNotes: isSupporterOrHigher,
    canAccessPatronExtras: isPatron,
    currentPeriodEnd: subscription?.current_period_end || null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
  };
}

export function requireAccess(
  access: ReaderAccess,
  feature: "ebook" | "early" | "notes" | "patron"
): boolean {
  switch (feature) {
    case "ebook":
      return access.canReadFullBook;
    case "early":
      return access.canReadEarlyChapters;
    case "notes":
      return access.canAccessSupporterNotes;
    case "patron":
      return access.canAccessPatronExtras;
    default:
      return false;
  }
}

export interface ClientAccess {
  canReadChapterOne: boolean;
  canReadFullBook: boolean;
  canReadEarlyChapters: boolean;
  canAccessSupporterNotes: boolean;
  canAccessPatronExtras: boolean;
}

export function checkClientAccess(
  access: ClientAccess | null,
  feature: keyof ClientAccess
): boolean {
  if (!access) return false;
  return access[feature] || false;
}
