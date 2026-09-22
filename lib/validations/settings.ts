import { z } from "zod";

export const accountInfoSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .or(z.literal(""))
    .optional(),
});

export type AccountInfoInput = z.infer<typeof accountInfoSchema>;

export const notificationPreferencesSchema = z.object({
  email_notifications: z.boolean(),
  account_alerts: z.boolean(),
  payment_alerts: z.boolean(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
