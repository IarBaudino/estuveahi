export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "client" | "photographer" | "admin";
export type EventStatus = "draft" | "published" | "archived";
export type EventCategory =
  | "concert"
  | "festival"
  | "theater"
  | "sports"
  | "conference"
  | "convention"
  | "other";
export type PurchaseRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          phone: string | null;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      photographer_profiles: {
        Row: {
          id: string;
          display_name: string;
          bio: string | null;
          website_url: string | null;
          instagram_handle: string | null;
          portfolio_url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          bio?: string | null;
          website_url?: string | null;
          instagram_handle?: string | null;
          portfolio_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          bio?: string | null;
          website_url?: string | null;
          instagram_handle?: string | null;
          portfolio_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          photographer_id: string;
          title: string;
          slug: string;
          description: string | null;
          category: EventCategory;
          venue: string | null;
          city: string | null;
          country: string;
          event_date: string;
          status: EventStatus;
          cover_photo_id: string | null;
          qr_code: string;
          is_public: boolean;
          photo_count: number;
          search_vector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          photographer_id: string;
          title: string;
          slug: string;
          description?: string | null;
          category?: EventCategory;
          venue?: string | null;
          city?: string | null;
          country?: string;
          event_date: string;
          status?: EventStatus;
          cover_photo_id?: string | null;
          qr_code: string;
          is_public?: boolean;
          photo_count?: number;
          search_vector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          photographer_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          category?: EventCategory;
          venue?: string | null;
          city?: string | null;
          country?: string;
          event_date?: string;
          status?: EventStatus;
          cover_photo_id?: string | null;
          qr_code?: string;
          is_public?: boolean;
          photo_count?: number;
          search_vector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          event_id: string;
          photographer_id: string;
          storage_path: string;
          thumbnail_path: string;
          preview_path: string;
          original_filename: string;
          mime_type: string;
          width: number | null;
          height: number | null;
          file_size_bytes: number;
          price_cents: number | null;
          currency: string;
          is_visible: boolean;
          sort_order: number;
          captured_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          photographer_id: string;
          storage_path: string;
          thumbnail_path: string;
          preview_path: string;
          original_filename: string;
          mime_type: string;
          width?: number | null;
          height?: number | null;
          file_size_bytes: number;
          price_cents?: number | null;
          currency?: string;
          is_visible?: boolean;
          sort_order?: number;
          captured_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          photographer_id?: string;
          storage_path?: string;
          thumbnail_path?: string;
          preview_path?: string;
          original_filename?: string;
          mime_type?: string;
          width?: number | null;
          height?: number | null;
          file_size_bytes?: number;
          price_cents?: number | null;
          currency?: string;
          is_visible?: boolean;
          sort_order?: number;
          captured_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          photo_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          photo_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          photo_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      purchase_requests: {
        Row: {
          id: string;
          client_id: string;
          photo_id: string;
          event_id: string;
          photographer_id: string;
          status: PurchaseRequestStatus;
          message: string | null;
          quoted_price_cents: number | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          photo_id: string;
          event_id: string;
          photographer_id: string;
          status?: PurchaseRequestStatus;
          message?: string | null;
          quoted_price_cents?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          photo_id?: string;
          event_id?: string;
          photographer_id?: string;
          status?: PurchaseRequestStatus;
          message?: string | null;
          quoted_price_cents?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      event_status: EventStatus;
      event_category: EventCategory;
      purchase_request_status: PurchaseRequestStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
