"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";

import { updateNotificationPreferences } from "@/app/(dashboard)/dashboard/settings/actions";
import type { NotificationPreferences } from "@/lib/supabase/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const ROWS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: "email_notifications",
    label: "Email notifications",
    description: "General updates about your account and orders.",
  },
  {
    key: "account_alerts",
    label: "Important account alerts",
    description: "Security events, verification status, and access changes.",
  },
  {
    key: "payment_alerts",
    label: "Payment / subscription alerts",
    description: "Successful purchases, renewals, and expiring plans.",
  },
];

export function NotificationsSection({ preferences }: { preferences: NotificationPreferences }) {
  const [prefs, setPrefs] = useState(preferences);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleToggle(key: keyof NotificationPreferences, checked: boolean) {
    const next = { ...prefs, [key]: checked };
    setPrefs(next);
    setPendingKey(key);
    startTransition(async () => {
      const result = await updateNotificationPreferences(next);
      setPendingKey(null);
      if (result?.error) {
        setPrefs(prefs);
        toast.error(result.error);
      } else {
        toast.success("Preferences saved");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>Choose what Trusta emails you about.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ROWS.map((row, i) => (
          <div key={row.key}>
            {i > 0 && <Separator className="mb-4" />}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={`notif-${row.key}`}>{row.label}</Label>
                <p className="mt-0.5 text-sm text-muted-foreground">{row.description}</p>
              </div>
              <Switch
                id={`notif-${row.key}`}
                checked={prefs[row.key]}
                disabled={pendingKey === row.key}
                onCheckedChange={(checked) => handleToggle(row.key, checked)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
