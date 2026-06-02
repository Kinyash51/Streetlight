import { pricing } from "@/lib/pricing";
import { createSupabaseServerClient } from "@/lib/supabase";

export type AccessLevel = "free" | "ebook" | "supporter" | "patron";

export type ReaderAccess = {
  level: AccessLevel;
  canReadChapterOne: boolean;
  canReadFullBook: boolean;
  canReadEarlyChapters: boolean;
  canAccessSupporterNotes: boolean;
  canAccessBonusStories: boolean;
  canJoinPatronDiscord: boolean;
  subscription: {
    status: string | null;
    tier: string | null;
  } | null;
};

export async function getReaderAccess(userId?: string): Promise<ReaderAccess> {
  const defaultAccess: ReaderAccess = {
    level: "free",
    canReadChapterOne: true,
    canReadFullBook: false,
    canReadEarlyChapters: false,
    canAccessSupporterNotes: false,
    canAccessBonusStories: false,
    canJoinPatronDiscord: false,
    subscription: null,
  };

  if (!userId) {
    return defaultAccess;
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: subscription }, { data: orders }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("product, status")
      .eq("user_id", userId)
      .eq("product", pricing.ebook.checkoutProduct)
      .eq("status", "paid"),
  ]);

  const tier = subscription?.tier ?? null;
  const hasEbook = Boolean(orders?.length);
  const hasActiveSubscription = Boolean(subscription);
  let level: AccessLevel = "free";

  if (tier === pricing.patron.checkoutProduct) {
    level = "patron";
  } else if (tier === pricing.supporter.checkoutProduct) {
    level = "supporter";
  } else if (hasEbook) {
    level = "ebook";
  }

  return {
    level,
    canReadChapterOne: true,
    canReadFullBook: hasEbook || hasActiveSubscription,
    canReadEarlyChapters: hasActiveSubscription,
    canAccessSupporterNotes: hasActiveSubscription,
    canAccessBonusStories: tier === pricing.patron.checkoutProduct,
    canJoinPatronDiscord: tier === pricing.patron.checkoutProduct,
    subscription: subscription
      ? {
          status: subscription.status,
          tier: subscription.tier,
        }
      : null,
  };
}

export function requireAccess(
  access: ReaderAccess,
  requiredLevel: AccessLevel
) {
  const levels: Record<AccessLevel, number> = {
    free: 0,
    ebook: 1,
    supporter: 2,
    patron: 3,
  };

  return levels[access.level] >= levels[requiredLevel];
}
