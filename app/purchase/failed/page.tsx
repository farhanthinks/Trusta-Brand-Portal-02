import Link from "next/link";
import { XCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PurchaseFailedPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const supabase = await createClient();
  const { data: order } = searchParams.order_id
    ? await supabase.from("orders").select("item_type").eq("id", searchParams.order_id).maybeSingle()
    : { data: null };

  const retryHref = order ? `/purchase/${order.item_type}` : "/purchase";

  return (
    <div className="mx-auto max-w-lg py-10">
      <Card className="border-destructive/20">
        <CardHeader className="items-center text-center">
          <XCircle className="mb-2 size-10 text-destructive" />
          <CardTitle>Payment did not go through</CardTitle>
          <CardDescription>
            Your payment was not completed. No amount has been charged. You can try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href={retryHref}>
            <Button className="w-full">Try again</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Back to dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
