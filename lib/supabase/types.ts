export type BrandStatus =
  | "registered"
  | "profile_completed"
  | "verification_pending"
  | "verified"
  | "approved"
  | "rejected";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type ApprovalStatus = "approved" | "rejected";

export type CatalogItemType = "qr" | "dynamic_qr" | "subscription" | "other";

export type PaymentStatus = "pending" | "success" | "failed";

export interface TierOption {
  label: string;
  quantity: number;
  price: number;
}

export interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean;
  is_suspended: boolean;
  created_at: string;
}

export type ActivityEventType =
  | "login"
  | "logout"
  | "profile_update"
  | "purchase"
  | "upload_attempt"
  | "verification_submitted";

export interface ActivityLog {
  id: string;
  user_id: string;
  event_type: ActivityEventType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  login_at: string;
  logout_at: string | null;
  last_seen_at: string;
  duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  gstin: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  contact_number: string | null;
  logo_url: string | null;
  status: BrandStatus;
  created_at: string;
  updated_at: string;
}

export interface BrandVerification {
  id: string;
  brand_id: string;
  document_url: string;
  document_type: string;
  status: VerificationStatus;
  remarks: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface BrandApproval {
  id: string;
  brand_id: string;
  status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  remarks: string | null;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  name: string;
  description: string | null;
  tier_options: TierOption[] | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

export interface OrderItemDetails {
  tier_label?: string;
  quantity?: number;
  unit_price?: number;
  plan_name?: string;
  billing_cycle?: "monthly" | "yearly";
  [key: string]: unknown;
}

export interface Order {
  id: string;
  brand_id: string;
  catalog_item_id: string | null;
  item_type: CatalogItemType;
  item_details: OrderItemDetails;
  quantity: number;
  amount: number;
  currency: string;
  payment_provider: string;
  payment_id: string | null;
  razorpay_order_id: string | null;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface BrandEntitlement {
  id: string;
  brand_id: string;
  qr_quota: number;
  dynamic_qr_quota: number;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  updated_at: string;
}

type Relationships = [];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: Relationships;
      };
      brands: {
        Row: Brand;
        Insert: Partial<Brand> & { user_id: string };
        Update: Partial<Brand>;
        Relationships: Relationships;
      };
      brand_verifications: {
        Row: BrandVerification;
        Insert: Partial<BrandVerification> & {
          brand_id: string;
          document_url: string;
        };
        Update: Partial<BrandVerification>;
        Relationships: Relationships;
      };
      brand_approvals: {
        Row: BrandApproval;
        Insert: Partial<BrandApproval> & {
          brand_id: string;
          status: ApprovalStatus;
        };
        Update: Partial<BrandApproval>;
        Relationships: Relationships;
      };
      catalog_items: {
        Row: CatalogItem;
        Insert: Partial<CatalogItem> & { type: CatalogItemType; name: string };
        Update: Partial<CatalogItem>;
        Relationships: Relationships;
      };
      orders: {
        Row: Order;
        Insert: Partial<Order> & {
          brand_id: string;
          item_type: CatalogItemType;
          amount: number;
        };
        Update: Partial<Order>;
        Relationships: Relationships;
      };
      brand_entitlements: {
        Row: BrandEntitlement;
        Insert: Partial<BrandEntitlement> & { brand_id: string };
        Update: Partial<BrandEntitlement>;
        Relationships: Relationships;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Partial<ActivityLog> & {
          user_id: string;
          event_type: ActivityEventType;
        };
        Update: Partial<ActivityLog>;
        Relationships: Relationships;
      };
      user_sessions: {
        Row: UserSession;
        Insert: Partial<UserSession> & { user_id: string };
        Update: Partial<UserSession>;
        Relationships: Relationships;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
