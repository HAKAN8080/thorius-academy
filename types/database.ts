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

