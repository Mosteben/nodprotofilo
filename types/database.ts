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
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  /** Set manually by the admin after replying from their mail app. */
  replied_at: string | null;
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
  about: Json;
} & Timestamps;

export type GalleryItemRow = {
  id: string;
  media_id: string | null;
  image_url: string;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
  category: string | null;
  sort_order: number;
  published: boolean;
} & Timestamps;

export type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  author: string | null;
  file_path: string | null;
  file_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  external_url: string | null;
  sort_order: number;
  published: boolean;
} & Timestamps;

export type BookRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  publication_year: number | null;
  category: string | null;
  cover_image_url: string | null;
  pages: number | null;
  price_label: string | null;
  purchase_url: string | null;
  sample_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
} & Timestamps;

export type LectureRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  speaker: string | null;
  lecture_date: string | null;
  category: string | null;
  youtube_id: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
} & Timestamps;

export type CommentContentType = "article" | "project" | "book" | "lecture";

export type CommentRow = {
  id: string;
  user_id: string | null;
  content_type: CommentContentType;
  content_id: string;
  author_name: string;
  author_email: string | null;
  body: string;
  is_anonymous: boolean;
  is_approved: boolean;
  is_read: boolean;
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
      messages: Table<MessageRow, "is_read" | "name" | "email" | "subject" | "replied_at">;
      site_settings: Table<SiteSettingsRow, Exclude<keyof SiteSettingsRow, Generated>>;
      gallery_items: Table<GalleryItemRow, Exclude<keyof GalleryItemRow, Generated | "image_url">>;
      resources: Table<ResourceRow, Exclude<keyof ResourceRow, Generated | "title">>;
      books: Table<BookRow, Exclude<keyof BookRow, Generated | "title" | "slug">>;
      lectures: Table<LectureRow, Exclude<keyof LectureRow, Generated | "title" | "slug">>;
      comments: Table<
        CommentRow,
        "user_id" | "author_email" | "is_anonymous" | "is_approved" | "is_read"
      >;
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
      get_approved_comments: {
        Args: { p_type: string; p_id: string };
        Returns: { id: string; display_name: string | null; body: string; created_at: string }[];
      };
      is_published_content: { Args: { p_type: string; p_id: string }; Returns: boolean };
    };
    Enums: { content_status: ContentStatus };
    CompositeTypes: { [_ in never]: never };
  };
};
