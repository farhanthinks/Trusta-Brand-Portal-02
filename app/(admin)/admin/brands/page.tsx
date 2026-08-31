import { createClient } from "@/lib/supabase/server";
import { BrandsQueue } from "@/components/admin/brands/brands-queue";
import { PageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { reviewApproval, reviewVerification } from "./actions";
import type { BrandVerification } from "@/lib/supabase/types";

export default async function AdminBrandsPage() {
  const supabase = await createClient();

  const [{ data: pendingVerification }, { data: pendingApproval }] = await Promise.all([
    supabase
      .from("brands")
      .select("*")
      .eq("status", "verification_pending")
      .order("updated_at", { ascending: true }),
    supabase
      .from("brands")
      .select("*")
      .eq("status", "verified")
      .order("updated_at", { ascending: true }),
  ]);

  const allBrandIds = [
    ...(pendingVerification ?? []).map((b) => b.id),
    ...(pendingApproval ?? []).map((b) => b.id),
  ];

  let docsByBrand = new Map<string, BrandVerification[]>();
  if (allBrandIds.length > 0) {
    const { data: docs } = await supabase
      .from("brand_verifications")
      .select("*")
      .in("brand_id", allBrandIds)
      .order("created_at", { ascending: true });

    docsByBrand = new Map();
    for (const doc of docs ?? []) {
      const list = docsByBrand.get(doc.brand_id) ?? [];
      list.push(doc);
      docsByBrand.set(doc.brand_id, list);
    }
  }

  const signedUrlCache = new Map<string, string>();
  async function resolveDocUrl(path: string) {
    if (signedUrlCache.has(path)) return signedUrlCache.get(path)!;
    const { data } = await supabase.storage.from("brand-documents").createSignedUrl(path, 300);
    const url = data?.signedUrl ?? "#";
    signedUrlCache.set(path, url);
    return url;
  }

  async function withDocs(brands: typeof pendingVerification) {
    return Promise.all(
      (brands ?? []).map(async (brand) => {
        const docs = docsByBrand.get(brand.id) ?? [];
        const docsWithUrls = await Promise.all(
          docs.map(async (d) => ({ ...d, url: await resolveDocUrl(d.document_url) }))
        );
        return { brand, docs: docsWithUrls };
      })
    );
  }

  const [verificationQueue, approvalQueue] = await Promise.all([
    withDocs(pendingVerification),
    withDocs(pendingApproval),
  ]);

  return (
    <div>
      <PageHeader
        title="Brand review"
        description="Review uploaded documents and approve or reject brand applications."
        action={<RefreshButton />}
      />

      <BrandsQueue
        verificationQueue={verificationQueue}
        approvalQueue={approvalQueue}
        onReviewVerification={reviewVerification}
        onReviewApproval={reviewApproval}
      />
    </div>
  );
}
