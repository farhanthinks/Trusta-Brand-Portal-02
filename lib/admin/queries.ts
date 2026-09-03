import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_WINDOW_SECONDS } from "./sessions";
import type {
  ActivityEventType,
  Brand,
  BrandActivitySummaryRow,
  BrandStatus,
} from "@/lib/supabase/types";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Midnight IST (Asia/Kolkata) on the same IST calendar day as `d`, returned
 * as the correct UTC instant. Uses only UTC getters/setters so it doesn't
 * depend on the server process's local timezone (unlike `d.setHours()`,
 * which reads/writes server-local time and drifts between a dev machine and
 * a UTC-default production host — the same class of bug fixed for display
 * formatting in lib/format.ts).
 */
function startOfDay(d: Date): Date {
  const shifted = new Date(d.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export interface DisplayUser {
  user_id: string;
  business_name: string | null;
  email: string | null;
  logo_url: string | null;
  brand_id: string | null;
}

/** Batch-resolves {business_name, email, logo_url, brand_id} for a set of auth user ids. */
export async function getUserDisplayMap(
  userIds: string[]
): Promise<Map<string, DisplayUser>> {
  const map = new Map<string, DisplayUser>();
  if (userIds.length === 0) return map;
  const uniqueIds = Array.from(new Set(userIds));

  const supabase = await createClient();
  const [{ data: brands }, { data: profiles }] = await Promise.all([
    supabase.from("brands").select("id, user_id, business_name, logo_url").in("user_id", uniqueIds),
    supabase.from("profiles").select("id, email").in("id", uniqueIds),
  ]);

  for (const id of uniqueIds) {
    const brand = brands?.find((b) => b.user_id === id);
    map.set(id, {
      user_id: id,
      business_name: brand?.business_name ?? null,
      logo_url: brand?.logo_url ?? null,
      brand_id: brand?.id ?? null,
      email: profiles?.find((p) => p.id === id)?.email ?? null,
    });
  }
  return map;
}

/**
 * Activity/session views are meant to track brand-user behavior, not admin
 * staff browsing the dashboard — admin logins/sessions are excluded from
 * all of them (Overview tiles, Activity Logs, Active Sessions).
 */
async function getAdminUserIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id").eq("is_admin", true);
  return (data ?? []).map((p) => p.id);
}

// ---------------------------------------------------------------------------
// Overview / bento grid
// ---------------------------------------------------------------------------

export interface ActiveUserSummary {
  user_id: string;
  business_name: string | null;
  email: string | null;
  last_seen_at: string;
}

export async function getActiveUsersNow(): Promise<{
  count: number;
  users: ActiveUserSummary[];
}> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_SECONDS * 1000).toISOString();
  const adminIds = await getAdminUserIds();

  let query = supabase
    .from("user_sessions")
    .select("user_id, last_seen_at", { count: "exact" })
    .eq("is_active", true)
    .gte("last_seen_at", cutoff);
  if (adminIds.length > 0) query = query.not("user_id", "in", `(${adminIds.join(",")})`);

  const { data, count } = await query.order("last_seen_at", { ascending: false });

  const rows = data ?? [];
  const displayMap = await getUserDisplayMap(rows.map((r) => r.user_id));

  const users = rows.slice(0, 8).map((r) => ({
    user_id: r.user_id,
    last_seen_at: r.last_seen_at,
    business_name: displayMap.get(r.user_id)?.business_name ?? null,
    email: displayMap.get(r.user_id)?.email ?? null,
  }));

  return { count: count ?? rows.length, users };
}

export async function getPendingApprovalsCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("brands")
    .select("id", { count: "exact", head: true })
    .in("status", ["verification_pending", "verified"]);
  return count ?? 0;
}

export interface BrandsBreakdown {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export async function getBrandsBreakdown(): Promise<BrandsBreakdown> {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("status");
  const rows = data ?? [];

  let approved = 0;
  let rejected = 0;
  let pending = 0;
  for (const row of rows) {
    const status = row.status as BrandStatus;
    if (status === "approved") approved++;
    else if (status === "rejected") rejected++;
    else pending++;
  }

  return { total: rows.length, approved, pending, rejected };
}

export interface RegistrationStats {
  today: number;
  thisWeek: number;
  sparkline: { date: string; count: number }[];
}

export async function getNewRegistrations(): Promise<RegistrationStats> {
  const supabase = await createClient();
  const since = daysAgo(6);
  since.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("brands")
    .select("created_at")
    .gte("created_at", since.toISOString());

  const rows = data ?? [];
  const todayStart = startOfDay(new Date());

  const buckets: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }

  let today = 0;
  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    if (key in buckets) buckets[key]++;
    if (new Date(row.created_at) >= todayStart) today++;
  }

  return {
    today,
    thisWeek: rows.length,
    sparkline: Object.entries(buckets).map(([date, count]) => ({ date, count })),
  };
}

export async function getRevenueThisMonth(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("amount")
    .eq("payment_status", "success")
    .gte("created_at", startOfMonth(new Date()).toISOString());

  return (data ?? []).reduce((sum, o) => sum + Number(o.amount), 0);
}

export interface RecentActivityRow {
  id: string;
  event_type: ActivityEventType;
  created_at: string;
  metadata: Record<string, unknown>;
  business_name: string | null;
  email: string | null;
}

export async function getRecentActivity(limit = 8): Promise<RecentActivityRow[]> {
  const supabase = await createClient();
  const adminIds = await getAdminUserIds();

  let query = supabase
    .from("activity_logs")
    .select("id, user_id, event_type, metadata, created_at");
  if (adminIds.length > 0) query = query.not("user_id", "in", `(${adminIds.join(",")})`);

  const { data } = await query.order("created_at", { ascending: false }).limit(limit);

  const rows = data ?? [];
  const displayMap = await getUserDisplayMap(rows.map((r) => r.user_id));

  return rows.map((r) => ({
    id: r.id,
    event_type: r.event_type,
    created_at: r.created_at,
    metadata: r.metadata,
    business_name: displayMap.get(r.user_id)?.business_name ?? null,
    email: displayMap.get(r.user_id)?.email ?? null,
  }));
}

export async function getAvgApprovalTurnaroundHours(): Promise<number | null> {
  const supabase = await createClient();
  const { data: approvals } = await supabase
    .from("brand_approvals")
    .select("brand_id, approved_at")
    .eq("status", "approved")
    .not("approved_at", "is", null);

  if (!approvals || approvals.length === 0) return null;

  const { data: brands } = await supabase
    .from("brands")
    .select("id, created_at")
    .in("id", approvals.map((a) => a.brand_id));

  const brandMap = new Map((brands ?? []).map((b) => [b.id, b.created_at]));

  const durations: number[] = [];
  for (const approval of approvals) {
    const createdAt = brandMap.get(approval.brand_id);
    if (!createdAt || !approval.approved_at) continue;
    const hours =
      (new Date(approval.approved_at).getTime() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60);
    if (hours >= 0) durations.push(hours);
  }

  if (durations.length === 0) return null;
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}

// ---------------------------------------------------------------------------
// User Management (/admin/users)
// ---------------------------------------------------------------------------

export interface UsersListFilters {
  page: number;
  pageSize: number;
  search?: string;
  status?: BrandStatus;
  businessType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserListRow {
  brand_id: string;
  user_id: string;
  business_name: string | null;
  email: string | null;
  business_type: string | null;
  status: BrandStatus;
  created_at: string;
  is_admin: boolean;
  is_suspended: boolean;
  last_active_at: string | null;
}

export async function getUsersList(
  filters: UsersListFilters
): Promise<{ rows: UserListRow[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("brands")
    .select("id, user_id, business_name, business_type, status, created_at", {
      count: "exact",
    });

  if (filters.search) {
    query = query.ilike("business_name", `%${filters.search}%`);
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.businessType) query = query.eq("business_type", filters.businessType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);
  const rows = data ?? [];
  const userIds = rows.map((r) => r.user_id);

  const [{ data: profiles }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("id, email, is_admin, is_suspended").in("id", userIds),
    supabase
      .from("user_sessions")
      .select("user_id, last_seen_at")
      .in("user_id", userIds)
      .order("last_seen_at", { ascending: false }),
  ]);

  const lastActiveMap = new Map<string, string>();
  for (const s of sessions ?? []) {
    if (!lastActiveMap.has(s.user_id)) lastActiveMap.set(s.user_id, s.last_seen_at);
  }

  return {
    total: count ?? rows.length,
    rows: rows.map((r) => {
      const profile = profiles?.find((p) => p.id === r.user_id);
      return {
        brand_id: r.id,
        user_id: r.user_id,
        business_name: r.business_name,
        business_type: r.business_type,
        status: r.status as BrandStatus,
        created_at: r.created_at,
        email: profile?.email ?? null,
        is_admin: Boolean(profile?.is_admin),
        is_suspended: Boolean(profile?.is_suspended),
        last_active_at: lastActiveMap.get(r.user_id) ?? null,
      };
    }),
  };
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
}

export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const [{ count: total }, { count: suspendedProfiles }] = await Promise.all([
    supabase.from("brands").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_suspended", true),
  ]);

  const suspended = suspendedProfiles ?? 0;
  const totalCount = total ?? 0;
  return { total: totalCount, active: Math.max(0, totalCount - suspended), suspended };
}

export interface UserDetail {
  brand: Record<string, unknown> | null;
  profile: Record<string, unknown> | null;
  verifications: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  recentActivity: Record<string, unknown>[];
}

export async function getUserDetail(brandId: string): Promise<UserDetail> {
  const supabase = await createClient();
  const { data: brand } = await supabase.from("brands").select("*").eq("id", brandId).maybeSingle();
  if (!brand) {
    return { brand: null, profile: null, verifications: [], orders: [], recentActivity: [] };
  }

  const [{ data: profile }, { data: verifications }, { data: orders }, { data: activity }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", brand.user_id).maybeSingle(),
      supabase
        .from("brand_verifications")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", brand.user_id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return {
    brand,
    profile: profile ?? null,
    verifications: verifications ?? [],
    orders: orders ?? [],
    recentActivity: activity ?? [],
  };
}

export interface AdminSummary {
  id: string;
  email: string | null;
}

export async function getAdminsList(): Promise<AdminSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, email").eq("is_admin", true);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Approval History (/admin/approvals)
// ---------------------------------------------------------------------------

export interface ApprovalHistoryFilters {
  page: number;
  pageSize: number;
  actionType?: "verified" | "rejected_verification" | "approved" | "rejected_approval";
  adminId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApprovalHistoryDecision {
  action: "verified" | "rejected_verification" | "approved" | "rejected_approval";
  performed_by: string | null;
  performed_by_email: string | null;
  remarks: string | null;
  created_at: string;
}

/**
 * One card per brand — a brand's verification decision and approval
 * decision are two different lifecycle stages of the *same* review, not
 * separate history events, so they're grouped here rather than rendered as
 * two near-identical rows (same brand, often the same admin).
 */
export interface ApprovalHistoryRow {
  brand_id: string;
  business_name: string | null;
  verification: ApprovalHistoryDecision | null;
  approval: ApprovalHistoryDecision | null;
  latest_at: string;
}

export async function getApprovalHistory(
  filters: ApprovalHistoryFilters
): Promise<{ rows: ApprovalHistoryRow[]; total: number }> {
  const supabase = await createClient();

  let verificationsQuery = supabase
    .from("brand_verifications")
    .select("id, brand_id, status, remarks, verified_by, verified_at")
    .not("verified_at", "is", null);
  let approvalsQuery = supabase
    .from("brand_approvals")
    .select("id, brand_id, status, remarks, approved_by, approved_at, created_at");

  if (filters.dateFrom) {
    verificationsQuery = verificationsQuery.gte("verified_at", filters.dateFrom);
    approvalsQuery = approvalsQuery.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    verificationsQuery = verificationsQuery.lte("verified_at", filters.dateTo);
    approvalsQuery = approvalsQuery.lte("created_at", filters.dateTo);
  }
  if (filters.adminId) {
    verificationsQuery = verificationsQuery.eq("verified_by", filters.adminId);
    approvalsQuery = approvalsQuery.eq("approved_by", filters.adminId);
  }

  // Both buckets are always fetched (regardless of actionType) so a brand's
  // card can show both badges together — actionType narrows which *cards*
  // qualify further down, not which decisions get fetched.
  const [{ data: verifications }, { data: approvals }] = await Promise.all([
    verificationsQuery,
    approvalsQuery,
  ]);

  interface FlatDecision extends ApprovalHistoryDecision {
    source: "verification" | "approval";
    brand_id: string;
  }

  let flat: FlatDecision[] = [
    ...(verifications ?? []).map((v) => ({
      source: "verification" as const,
      action: (v.status === "verified" ? "verified" : "rejected_verification") as FlatDecision["action"],
      brand_id: v.brand_id,
      performed_by: v.verified_by,
      performed_by_email: null,
      remarks: v.remarks,
      created_at: v.verified_at as string,
    })),
    ...(approvals ?? []).map((a) => ({
      source: "approval" as const,
      action: (a.status === "approved" ? "approved" : "rejected_approval") as FlatDecision["action"],
      brand_id: a.brand_id,
      performed_by: a.approved_by,
      performed_by_email: null,
      remarks: a.remarks,
      created_at: a.created_at,
    })),
  ];

  // A single "verify"/"reject" decision updates two brand_verifications rows
  // at once (business_proof + id_proof), sharing the same brand/action/actor/
  // timestamp — collapse those into the one decision they actually represent.
  const seen = new Map<string, FlatDecision>();
  for (const row of flat) {
    const key = `${row.source}|${row.brand_id}|${row.action}|${row.performed_by}|${row.created_at}`;
    if (!seen.has(key)) seen.set(key, row);
  }
  flat = Array.from(seen.values());
  flat.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Group into one card per brand. Sorted desc above, so the first
  // verification/approval encountered per brand is its most recent.
  const byBrand = new Map<string, ApprovalHistoryRow>();
  for (const row of flat) {
    const existing = byBrand.get(row.brand_id) ?? {
      brand_id: row.brand_id,
      business_name: null,
      verification: null,
      approval: null,
      latest_at: row.created_at,
    };
    const decision: ApprovalHistoryDecision = {
      action: row.action,
      performed_by: row.performed_by,
      performed_by_email: null,
      remarks: row.remarks,
      created_at: row.created_at,
    };
    if (row.source === "verification" && !existing.verification) existing.verification = decision;
    if (row.source === "approval" && !existing.approval) existing.approval = decision;
    byBrand.set(row.brand_id, existing);
  }

  let cards = Array.from(byBrand.values());

  if (filters.actionType) {
    cards = cards.filter(
      (c) => c.verification?.action === filters.actionType || c.approval?.action === filters.actionType
    );
  }

  cards.sort((a, b) => new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime());

  const total = cards.length;
  const from = (filters.page - 1) * filters.pageSize;
  const page = cards.slice(from, from + filters.pageSize);

  const brandIds = Array.from(new Set(page.map((r) => r.brand_id)));
  const adminIds = Array.from(
    new Set(
      page.flatMap((r) => [r.verification?.performed_by, r.approval?.performed_by]).filter((x): x is string => Boolean(x))
    )
  );

  const [{ data: brands }, { data: admins }] = await Promise.all([
    brandIds.length
      ? supabase.from("brands").select("id, business_name").in("id", brandIds)
      : Promise.resolve({ data: [] as { id: string; business_name: string | null }[] }),
    adminIds.length
      ? supabase.from("profiles").select("id, email").in("id", adminIds)
      : Promise.resolve({ data: [] as { id: string; email: string | null }[] }),
  ]);

  function withEmail(d: ApprovalHistoryDecision | null): ApprovalHistoryDecision | null {
    if (!d) return null;
    return { ...d, performed_by_email: admins?.find((a) => a.id === d.performed_by)?.email ?? null };
  }

  return {
    total,
    rows: page.map((r) => ({
      ...r,
      business_name: brands?.find((b) => b.id === r.brand_id)?.business_name ?? null,
      verification: withEmail(r.verification),
      approval: withEmail(r.approval),
    })),
  };
}

export interface ApprovalStats {
  approved: number;
  rejected: number;
}

export async function getApprovalStats(): Promise<ApprovalStats> {
  const supabase = await createClient();
  const [{ count: approved }, { count: rejected }] = await Promise.all([
    supabase.from("brand_approvals").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("brand_approvals").select("id", { count: "exact", head: true }).eq("status", "rejected"),
  ]);
  return { approved: approved ?? 0, rejected: rejected ?? 0 };
}

export interface FilterUserOption {
  user_id: string;
  business_name: string | null;
  email: string | null;
}

/** Lightweight list of brand users for filter dropdowns (logs/sessions pages). */
export async function getAllUsersForFilter(): Promise<FilterUserOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("user_id, business_name")
    .order("business_name", { ascending: true })
    .limit(500);

  const rows = data ?? [];
  const displayMap = await getUserDisplayMap(rows.map((r) => r.user_id));

  return rows.map((r) => ({
    user_id: r.user_id,
    business_name: r.business_name,
    email: displayMap.get(r.user_id)?.email ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Activity Logs (/admin/logs)
// ---------------------------------------------------------------------------

export interface ActivityLogsFilters {
  page: number;
  pageSize: number;
  userId?: string;
  eventType?: ActivityEventType;
  dateFrom?: string;
  dateTo?: string;
}

export async function getActivityLogsList(
  filters: ActivityLogsFilters
): Promise<{ rows: RecentActivityRow[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  const adminIds = await getAdminUserIds();

  let query = supabase
    .from("activity_logs")
    .select("id, user_id, event_type, metadata, created_at", { count: "exact" });

  if (adminIds.length > 0) query = query.not("user_id", "in", `(${adminIds.join(",")})`);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.eventType) query = query.eq("event_type", filters.eventType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);
  const rows = data ?? [];
  const displayMap = await getUserDisplayMap(rows.map((r) => r.user_id));

  return {
    total: count ?? rows.length,
    rows: rows.map((r) => ({
      id: r.id,
      event_type: r.event_type,
      created_at: r.created_at,
      metadata: r.metadata,
      business_name: displayMap.get(r.user_id)?.business_name ?? null,
      email: displayMap.get(r.user_id)?.email ?? null,
    })),
  };
}

export interface ActivityStats {
  total: number;
  today: number;
}

export async function getActivityStats(): Promise<ActivityStats> {
  const supabase = await createClient();
  const adminIds = await getAdminUserIds();
  const todayStart = startOfDay(new Date()).toISOString();

  let totalQuery = supabase.from("activity_logs").select("id", { count: "exact", head: true });
  let todayQuery = supabase
    .from("activity_logs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStart);

  if (adminIds.length > 0) {
    const exclusion = `(${adminIds.join(",")})`;
    totalQuery = totalQuery.not("user_id", "in", exclusion);
    todayQuery = todayQuery.not("user_id", "in", exclusion);
  }

  const [{ count: total }, { count: today }] = await Promise.all([totalQuery, todayQuery]);
  return { total: total ?? 0, today: today ?? 0 };
}

// ---------------------------------------------------------------------------
// Activity Logs — Page 1: brand activity summary (/admin/logs)
// One row per brand (latest event, events today, total events), computed
// server-side via the get_brand_activity_summary() Postgres function —
// PostgREST has no GROUP BY, and pulling every log row to aggregate in JS
// wouldn't scale, so the aggregation happens in the database.
// ---------------------------------------------------------------------------

export interface BrandActivitySummaryFilters {
  page: number;
  pageSize: number;
  search?: string;
  userId?: string;
  eventType?: ActivityEventType;
  dateFrom?: string;
  dateTo?: string;
}

export async function getBrandActivitySummary(
  filters: BrandActivitySummaryFilters
): Promise<{ rows: BrandActivitySummaryRow[]; total: number; page: number }> {
  const supabase = await createClient();

  async function fetchPage(page: number) {
    const offset = (page - 1) * filters.pageSize;
    return supabase.rpc("get_brand_activity_summary", {
      p_search: filters.search || null,
      p_user_id: filters.userId || null,
      p_event_type: filters.eventType || null,
      p_date_from: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
      p_date_to: filters.dateTo ? new Date(filters.dateTo).toISOString() : null,
      p_today_start: startOfDay(new Date()).toISOString(),
      p_limit: filters.pageSize,
      p_offset: offset,
    });
  }

  let { data, error } = await fetchPage(filters.page);
  let effectivePage = filters.page;

  // total_count rides on the returned rows (a window function evaluated
  // before LIMIT/OFFSET, so it's correct for any page that has at least one
  // row) — but a page with zero rows carries no row to read it from at all.
  // That's only reachable via a stale/hand-edited ?page=N (Next is always
  // disabled once a real last page is known), so rather than show a broken
  // "0 total" state, self-heal back to page 1 — and report that as the
  // effective page so the pagination UI stays consistent with what's shown.
  if (!error && data && data.length === 0 && filters.page > 1) {
    ({ data, error } = await fetchPage(1));
    effectivePage = 1;
  }

  if (error || !data) return { rows: [], total: 0, page: effectivePage };
  return { rows: data, total: data[0]?.total_count ?? 0, page: effectivePage };
}

// ---------------------------------------------------------------------------
// Activity Logs — Page 2: single-brand detail (/admin/logs/[brandId])
// ---------------------------------------------------------------------------

export interface BrandActivityProfile {
  brand: Brand;
  email: string | null;
}

export async function getBrandActivityProfile(brandId: string): Promise<BrandActivityProfile | null> {
  const supabase = await createClient();
  const { data: brand } = await supabase.from("brands").select("*").eq("id", brandId).maybeSingle();
  if (!brand) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", brand.user_id)
    .maybeSingle();

  return { brand, email: profile?.email ?? null };
}

export interface BrandActivityBrandStats {
  total: number;
  today: number;
}

/** Unfiltered totals for the stat cards — independent of the log table's active filters. */
export async function getBrandActivityBrandStats(brandId: string): Promise<BrandActivityBrandStats> {
  const supabase = await createClient();
  const todayStart = startOfDay(new Date()).toISOString();

  const [{ count: total }, { count: today }] = await Promise.all([
    supabase.from("activity_logs").select("id", { count: "exact", head: true }).eq("brand_id", brandId),
    supabase
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .gte("created_at", todayStart),
  ]);

  return { total: total ?? 0, today: today ?? 0 };
}

export interface BrandActivityLogRow {
  id: string;
  user_id: string;
  event_type: ActivityEventType;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface BrandActivityLogsFilters {
  brandId: string;
  page: number;
  pageSize: number;
  eventType?: ActivityEventType;
  dateFrom?: string;
  dateTo?: string;
}

export async function getBrandActivityLogs(
  filters: BrandActivityLogsFilters
): Promise<{ rows: BrandActivityLogRow[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("activity_logs")
    .select("id, user_id, event_type, metadata, ip_address, created_at", { count: "exact" })
    .eq("brand_id", filters.brandId);

  if (filters.eventType) query = query.eq("event_type", filters.eventType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);

  return { rows: data ?? [], total: count ?? 0 };
}

/** Full export (no pagination) for a single brand's CSV download. */
export async function getAllBrandActivityLogs(
  filters: Omit<BrandActivityLogsFilters, "page" | "pageSize">
): Promise<BrandActivityLogRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("activity_logs")
    .select("id, user_id, event_type, metadata, ip_address, created_at")
    .eq("brand_id", filters.brandId);

  if (filters.eventType) query = query.eq("event_type", filters.eventType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data } = await query.order("created_at", { ascending: false }).limit(10000);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Active Sessions (/admin/sessions)
// ---------------------------------------------------------------------------

export interface SessionsFilters {
  page: number;
  pageSize: number;
  status?: "active" | "inactive";
}

export interface SessionRow {
  id: string;
  user_id: string;
  business_name: string | null;
  email: string | null;
  logo_url: string | null;
  brand_id: string | null;
  login_at: string;
  logout_at: string | null;
  last_seen_at: string;
  duration_seconds: number | null;
  is_live: boolean;
}

export async function getSessionsList(
  filters: SessionsFilters
): Promise<{ rows: SessionRow[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_SECONDS * 1000).toISOString();
  const adminIds = await getAdminUserIds();

  let query = supabase
    .from("user_sessions")
    .select("id, user_id, login_at, logout_at, last_seen_at, duration_seconds, is_active", {
      count: "exact",
    });

  if (adminIds.length > 0) query = query.not("user_id", "in", `(${adminIds.join(",")})`);
  if (filters.status === "active") {
    query = query.eq("is_active", true).gte("last_seen_at", cutoff);
  } else if (filters.status === "inactive") {
    query = query.or(`is_active.eq.false,last_seen_at.lt.${cutoff}`);
  }

  const { data, count } = await query.order("login_at", { ascending: false }).range(from, to);
  const rows = data ?? [];
  const displayMap = await getUserDisplayMap(rows.map((r) => r.user_id));

  return {
    total: count ?? rows.length,
    rows: rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      business_name: displayMap.get(r.user_id)?.business_name ?? null,
      email: displayMap.get(r.user_id)?.email ?? null,
      logo_url: displayMap.get(r.user_id)?.logo_url ?? null,
      brand_id: displayMap.get(r.user_id)?.brand_id ?? null,
      login_at: r.login_at,
      logout_at: r.logout_at,
      last_seen_at: r.last_seen_at,
      duration_seconds: r.duration_seconds,
      is_live: r.is_active && r.last_seen_at >= cutoff,
    })),
  };
}

export interface SessionStats {
  activeNow: number;
  sessionsToday: number;
  totalSessions: number;
  totalTimeSeconds: number;
}

/** Header stat cards for the Active Sessions page — global counts, independent of the current filter/page. */
export async function getSessionStats(): Promise<SessionStats> {
  const supabase = await createClient();
  const adminIds = await getAdminUserIds();
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_SECONDS * 1000).toISOString();
  const todayStart = startOfDay(new Date()).toISOString();

  let activeQuery = supabase
    .from("user_sessions")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .gte("last_seen_at", cutoff);
  let todayQuery = supabase
    .from("user_sessions")
    .select("id", { count: "exact", head: true })
    .gte("login_at", todayStart);
  let totalQuery = supabase.from("user_sessions").select("id", { count: "exact", head: true });
  let durationQuery = supabase
    .from("user_sessions")
    .select("login_at, duration_seconds, is_active");

  if (adminIds.length > 0) {
    const exclusion = `(${adminIds.join(",")})`;
    activeQuery = activeQuery.not("user_id", "in", exclusion);
    todayQuery = todayQuery.not("user_id", "in", exclusion);
    totalQuery = totalQuery.not("user_id", "in", exclusion);
    durationQuery = durationQuery.not("user_id", "in", exclusion);
  }

  const [{ count: activeNow }, { count: sessionsToday }, { count: totalSessions }, { data: durationRows }] =
    await Promise.all([activeQuery, todayQuery, totalQuery, durationQuery]);

  let totalTimeSeconds = 0;
  for (const s of durationRows ?? []) {
    if (s.duration_seconds !== null) {
      totalTimeSeconds += s.duration_seconds;
    } else if (s.is_active) {
      totalTimeSeconds += Math.max(0, (Date.now() - new Date(s.login_at).getTime()) / 1000);
    }
  }

  return {
    activeNow: activeNow ?? 0,
    sessionsToday: sessionsToday ?? 0,
    totalSessions: totalSessions ?? 0,
    totalTimeSeconds,
  };
}

export interface SessionTimeSummary {
  totalTodaySeconds: number;
  totalThisWeekSeconds: number;
}

export async function getSessionSummaryForUser(userId: string): Promise<SessionTimeSummary> {
  const supabase = await createClient();
  const weekAgo = daysAgo(7);
  const today = startOfDay(new Date());

  const { data } = await supabase
    .from("user_sessions")
    .select("login_at, logout_at, last_seen_at")
    .eq("user_id", userId)
    .gte("login_at", weekAgo.toISOString());

  let totalToday = 0;
  let totalWeek = 0;
  for (const s of data ?? []) {
    const start = new Date(s.login_at);
    const end = new Date(s.logout_at ?? s.last_seen_at);
    const seconds = Math.max(0, (end.getTime() - start.getTime()) / 1000);
    totalWeek += seconds;
    if (start >= today) totalToday += seconds;
  }

  return { totalTodaySeconds: totalToday, totalThisWeekSeconds: totalWeek };
}

export interface UserSessionSummaryRow extends SessionTimeSummary {
  user_id: string;
  business_name: string | null;
  email: string | null;
  logo_url: string | null;
}

/** Per-user time-tracking summary for the last 7 days, most active first. */
export async function getAllSessionSummaries(): Promise<UserSessionSummaryRow[]> {
  const supabase = await createClient();
  const weekAgo = daysAgo(7);
  const today = startOfDay(new Date());
  const adminIds = await getAdminUserIds();

  let query = supabase
    .from("user_sessions")
    .select("user_id, login_at, logout_at, last_seen_at")
    .gte("login_at", weekAgo.toISOString());
  if (adminIds.length > 0) query = query.not("user_id", "in", `(${adminIds.join(",")})`);

  const { data } = await query;

  const byUser = new Map<string, SessionTimeSummary>();
  for (const s of data ?? []) {
    const start = new Date(s.login_at);
    const end = new Date(s.logout_at ?? s.last_seen_at);
    const seconds = Math.max(0, (end.getTime() - start.getTime()) / 1000);
    const existing = byUser.get(s.user_id) ?? { totalTodaySeconds: 0, totalThisWeekSeconds: 0 };
    existing.totalThisWeekSeconds += seconds;
    if (start >= today) existing.totalTodaySeconds += seconds;
    byUser.set(s.user_id, existing);
  }

  const displayMap = await getUserDisplayMap(Array.from(byUser.keys()));

  return Array.from(byUser.entries())
    .map(([userId, summary]) => ({
      user_id: userId,
      business_name: displayMap.get(userId)?.business_name ?? null,
      email: displayMap.get(userId)?.email ?? null,
      logo_url: displayMap.get(userId)?.logo_url ?? null,
      ...summary,
    }))
    .sort((a, b) => b.totalThisWeekSeconds - a.totalThisWeekSeconds);
}
