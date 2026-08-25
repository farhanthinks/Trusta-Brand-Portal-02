"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { brandProfileSchema, businessTypes, type BrandProfileInput } from "@/lib/validations/brand";
import { updateBrandProfile } from "@/app/(onboarding)/onboarding/actions";
import { uploadBrandLogo } from "@/lib/supabase/storage-upload";
import type { Brand } from "@/lib/supabase/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileUpload } from "./file-upload";

export function ProfileForm({
  brand,
  userId,
  onSaved,
}: {
  brand: Brand;
  userId: string;
  onSaved: () => void;
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(brand.logo_url);

  const form = useForm<BrandProfileInput>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      business_name: brand.business_name ?? "",
      business_type: (brand.business_type as BrandProfileInput["business_type"]) ?? undefined,
      gstin: brand.gstin ?? "",
      address: brand.address ?? "",
      city: brand.city ?? "",
      state: brand.state ?? "",
      pincode: brand.pincode ?? "",
      contact_number: brand.contact_number ?? "",
      logo_url: brand.logo_url,
    },
  });

  async function onSubmit(values: BrandProfileInput) {
    const result = await updateBrandProfile({ ...values, logo_url: logoUrl });
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile saved");
    onSaved();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FileUpload
          label="Business logo"
          helperText="PNG or JPG, up to 10MB"
          accept="image/*"
          value={logoUrl}
          onUpload={(file) => uploadBrandLogo(file, userId)}
          onUploaded={setLogoUrl}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Business name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Foods Pvt. Ltd." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="business_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gstin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GSTIN / registration number</FormLabel>
                <FormControl>
                  <Input placeholder="22AAAAA0000A1Z5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street, area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Maharashtra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input placeholder="400001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact number</FormLabel>
                <FormControl>
                  <Input placeholder="9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save and continue"}
        </Button>
      </form>
    </Form>
  );
}
