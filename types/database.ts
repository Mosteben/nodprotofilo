/**
 * Types for the Supabase schema defined in supabase/migrations.
 * Keep in sync with the SQL (or regenerate with `supabase gen types typescript`).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ContentStatus = "draft" | "published";

type Timestamps = { created_at: string; updated_at: string };

export type ProfileRow = {
  id: string;
  user_id: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  is_admin: boolean;
} & Timestamps;

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  status: ContentStatus;
  published_at: string | null;
} & Timestamps;

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  client: string | null;
  year: number | null;
  project_url: string | null;
  github_url: string | null;
  featured: boolean;
  published: boolean;
} & Timestamps;

export type MediaRow = {
  id: string;
  user_id: string | null;
  file_name: string;
  file_path: string;
  file_url: string;
  alt_text: string | null;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type SiteSettingsRow = {
  id: number;
  site_name: string | null;
  site_description: string | null;
  hero_title: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  about_title: string | null;
  about_description: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  behance_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  whatsapp_url: string | null;
  theme_settings: Json;
  homepage: Json;
} & Timestamps;

type Generated = "id" | "created_at" | "updated_at";

/** Insert shape: generated columns and columns with DB defaults become optional. */
type InsertOf<Row, Optional extends keyof Row> = Omit<Row, Generated | Optional> &
  Partial<Pick<Row, Extract<Generated | Optional, keyof Row>>>;

type Table<Row, Optional extends keyof Row> = {
  Row: Row;
  Insert: InsertOf<Row, Optional>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        "name" | "bio" | "avatar_url" | "email" | "phone" | "location" | "website" | "is_admin"
      >;
      articles: Table<
        ArticleRow,
        "excerpt" | "content" | "cover_image_url" | "category" | "tags" | "status" | "published_at"
      >;
      projects: Table<
        ProjectRow,
        | "description"
        | "content"
        | "cover_image_url"
        | "category"
        | "client"
        | "year"
        | "project_url"
        | "github_url"
        | "featured"
        | "published"
      >;
      media: Table<MediaRow, "user_id" | "alt_text" | "width" | "height">;
      messages: Table<MessageRow, "is_read">;
      site_settings: Table<SiteSettingsRow, Exclude<keyof SiteSettingsRow, Generated>>;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      get_public_profile: {
        Args: Record<PropertyKey, never>;
        Returns: {
          name: string | null;
          bio: string | null;
          avatar_url: string | null;
          location: string | null;
          website: string | null;
        }[];
      };
    };
    Enums: { content_status: ContentStatus };
    CompositeTypes: { [_ in never]: never };
  };
};
