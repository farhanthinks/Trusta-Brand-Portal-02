import { CheckCircle2 } from "lucide-react";

export function EmptyQueueState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="size-6 text-emerald-600" />
      </div>
      <p className="text-sm font-medium">All caught up</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
