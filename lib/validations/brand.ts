import { z } from "zod";

export const businessTypes = [
  "Sole Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "Public Limited",
  "Other",
] as const;

export const brandProfileSchema = z.object({
  business_name: z.string().min(2, "Business name is required").max(200),
  business_type: z.enum(businessTypes, {
    message: "Select a business type",
  }),
  gstin: z
    .string()
    .min(4, "Enter your GSTIN or registration number")
    .max(30),
  address: z.string().min(5, "Address is required").max(500),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  contact_number: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  logo_url: z.string().url().nullable().optional(),
});

export type BrandProfileInput = z.infer<typeof brandProfileSchema>;

export const verificationUploadSchema = z.object({
  business_proof_url: z.string().min(1, "Upload your business proof document"),
  id_proof_url: z.string().min(1, "Upload your ID proof document"),
});

export type VerificationUploadInput = z.infer<typeof verificationUploadSchema>;

export const approvalDecisionSchema = z.object({
  brand_id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  remarks: z.string().max(1000).optional(),
});

export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;
