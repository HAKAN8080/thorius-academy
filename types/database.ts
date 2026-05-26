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
          wp_instructor_id: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          wp_instructor_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          wp_instructor_id?: number | null;
          created_at?: string;
        };
      };
      instructors: {
        Row: {
          wp_user_id: number;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          synced_at: string;
        };
        Insert: {
          wp_user_id: number;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          synced_at?: string;
        };
        Update: {
          wp_user_id?: number;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          synced_at?: string;
        };
        Relationships: [];
      };
      instructor_course_stats: {
        Row: {
          wp_course_id: number;
          course_slug: string;
          instructor_wp_user_id: number;
          title: string;
          image_url: string | null;
          status: string;
          enrollment_count: number;
          rating_avg: number;
          rating_count: number;
          published_at: string | null;
          synced_at: string;
        };
        Insert: {
          wp_course_id: number;
          course_slug: string;
          instructor_wp_user_id: number;
          title: string;
          image_url?: string | null;
          status?: string;
          enrollment_count?: number;
          rating_avg?: number;
          rating_count?: number;
          published_at?: string | null;
          synced_at?: string;
        };
        Update: {
          wp_course_id?: number;
          course_slug?: string;
          instructor_wp_user_id?: number;
          title?: string;
          image_url?: string | null;
          status?: string;
          enrollment_count?: number;
          rating_avg?: number;
          rating_count?: number;
          published_at?: string | null;
          synced_at?: string;
        };
        Relationships: [];
      };
      instructor_course_reviews: {
        Row: {
          id: string;
          wp_course_id: number;
          wp_review_id: number;
          student_name: string | null;
          rating: number | null;
          review_text: string | null;
          reviewed_at: string | null;
          synced_at: string;
        };
        Insert: {
          id?: string;
          wp_course_id: number;
          wp_review_id: number;
          student_name?: string | null;
          rating?: number | null;
          review_text?: string | null;
          reviewed_at?: string | null;
          synced_at?: string;
        };
        Update: {
          id?: string;
          wp_course_id?: number;
          wp_review_id?: number;
          student_name?: string | null;
          rating?: number | null;
          review_text?: string | null;
          reviewed_at?: string | null;
          synced_at?: string;
        };
        Relationships: [];
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
      course_products: {
        Row: {
          id: string;
          course_slug: string;
          wp_course_id: number;
          wc_product_id: number;
          price_normal: number | null;
          price_sale: number | null;
          currency: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_slug: string;
          wp_course_id: number;
          wc_product_id: number;
          price_normal?: number | null;
          price_sale?: number | null;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_slug?: string;
          wp_course_id?: number;
          wc_product_id?: number;
          price_normal?: number | null;
          price_sale?: number | null;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
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
          source: string | null;
          wc_order_id: number | null;
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
          source?: string | null;
          wc_order_id?: number | null;
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
          source?: string | null;
          wc_order_id?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

