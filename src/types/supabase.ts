export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          payment_method: string
          is_paid: boolean
          created_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          payment_method: string
          is_paid?: boolean
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          payment_method?: string
          is_paid?: boolean
          created_at?: string
          paid_at?: string | null
        }
      }
      news: {
        Row: {
          id: string
          title: string
          content: string
          summary: string | null
          image_url: string | null
          video_url: string | null
          published_at: string | null
          is_published: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary?: string | null
          image_url?: string | null
          video_url?: string | null
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: string | null
          image_url?: string | null
          video_url?: string | null
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
