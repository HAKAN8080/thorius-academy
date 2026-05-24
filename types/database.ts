/**
 * Supabase veritabanı tipleri — şema oluşturuldukça genişletilecek.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: number;
          course_slug: string;
          wp_lesson_id: number;
          lesson_order: number;
          title: string;
          description: string | null;
          duration_seconds: number | null;
          video_type: "external_url" | "youtube" | "html5" | "vimeo" | null;
          video_url: string | null;
          video_embed_url: string | null;
          topic_title: string | null;
          topic_order: number | null;
          is_free: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: number;
          course_slug: string;
          wp_lesson_id: number;
          lesson_order: number;
          title: string;
          description?: string | null;
          duration_seconds?: number | null;
          video_type?: "external_url" | "youtube" | "html5" | "vimeo" | null;
          video_url?: string | null;
          video_embed_url?: string | null;
          topic_title?: string | null;
          topic_order?: number | null;
          is_free?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: number;
          course_slug?: string;
          wp_lesson_id?: number;
          lesson_order?: number;
          title?: string;
          description?: string | null;
          duration_seconds?: number | null;
          video_type?: "external_url" | "youtube" | "html5" | "vimeo" | null;
          video_url?: string | null;
          video_embed_url?: string | null;
          topic_title?: string | null;
          topic_order?: number | null;
          is_free?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: number;
          watched_seconds: number;
          completed: boolean;
          completed_at: string | null;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          course_id: number;
          watched_seconds?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          course_id?: number;
          watched_seconds?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: number;
          course_slug: string;
          course_title: string;
          course_image: string | null;
          course_category: string | null;
          instructor_name: string | null;
          enrolled_at: string;
          progress: number;
          completed_at: string | null;
          last_lesson_id: number | null;
          status: "active" | "completed" | "cancelled";
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: number;
          course_slug: string;
          course_title: string;
          course_image?: string | null;
          course_category?: string | null;
          instructor_name?: string | null;
          enrolled_at?: string;
          progress?: number;
          completed_at?: string | null;
          last_lesson_id?: number | null;
          status?: "active" | "completed" | "cancelled";
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: number;
          course_slug?: string;
          course_title?: string;
          course_image?: string | null;
          course_category?: string | null;
          instructor_name?: string | null;
          enrolled_at?: string;
          progress?: number;
          completed_at?: string | null;
          last_lesson_id?: number | null;
          status?: "active" | "completed" | "cancelled";
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

