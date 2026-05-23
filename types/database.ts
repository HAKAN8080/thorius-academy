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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type CourseCategory =
  | "planlama-otb"
  | "ai-veri"
  | "liderlik"
  | "operasyon"
  | "pazarlama"
  | "e-ticaret";

export interface Course {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  duration: string;
  price: number;
  category: CourseCategory;
  imageUrl: string;
  featured?: boolean;
}
