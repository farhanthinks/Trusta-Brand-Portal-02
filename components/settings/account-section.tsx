"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Loader2 } from "lucide-react";

import { accountInfoSchema, type AccountInfoInput } from "@/lib/validations/settings";
import { updateAccountInfo } from "@/app/(dashboard)/dashboard/settings/actions";
import type { Profile } from "@/lib/supabase/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChangePasswordDialog } from "./change-password-dialog";

export function AccountSection({ profile }: { profile: Profile }) {
  const form = useForm<AccountInfoInput>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
    },
  });

  async function onSubmit(values: AccountInfoInput) {
    const result = await updateAccountInfo(values);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Account details saved");
    form.reset(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-4 text-primary" />
          Account
        </CardTitle>
        <CardDescription>Your personal details on this account.</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input value={profile.email ?? ""} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                Your login email — contact support to change it.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="justify-between">
            <ChangePasswordDialog />
            <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
