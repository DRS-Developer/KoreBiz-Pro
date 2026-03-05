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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          role: 'admin' | 'editor'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          role?: 'admin' | 'editor'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          role?: 'admin' | 'editor'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: Json
          sections: Json
          meta_title: string | null
          meta_description: string | null
          featured_image: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content?: Json
          sections?: Json
          meta_title?: string | null
          meta_description?: string | null
          featured_image?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: Json
          sections?: Json
          meta_title?: string | null
          meta_description?: string | null
          featured_image?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_content: {
        Row: {
          id: string
          section_key: string
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          slug: string
          title: string
          short_description: string | null
          full_description: string | null
          icon: string | null
          image_url: string | null
          category: string | null
          order: number
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          short_description?: string | null
          full_description?: string | null
          icon?: string | null
          image_url?: string | null
          category?: string | null
          order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          short_description?: string | null
          full_description?: string | null
          icon?: string | null
          image_url?: string | null
          category?: string | null
          order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          image_url: string | null
          order: number
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          image_url?: string | null
          order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          image_url?: string | null
          order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      practice_areas: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          link: string | null
          order_index: number
          is_active: boolean
          what_we_offer: Json | null
          methodology: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          link?: string | null
          order_index?: number
          is_active?: boolean
          what_we_offer?: Json | null
          methodology?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          link?: string | null
          order_index?: number
          is_active?: boolean
          what_we_offer?: Json | null
          methodology?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          id: string
          slug: string
          title: string
          short_description: string | null
          description: string | null
          client: string | null
          completion_date: string | null
          category: string | null
          image_url: string | null
          location: string | null
          gallery_images: Json
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          client?: string | null
          completion_date?: string | null
          category?: string | null
          image_url?: string | null
          location?: string | null
          gallery_images?: Json
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          short_description?: string | null
          description?: string | null
          client?: string | null
          completion_date?: string | null
          category?: string | null
          image_url?: string | null
          location?: string | null
          gallery_images?: Json
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string | null
          message: string
          status: 'new' | 'read' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject?: string | null
          message: string
          status?: 'new' | 'read' | 'archived'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          message?: string
          status?: 'new' | 'read' | 'archived'
          created_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          site_name: string
          site_description: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          logo_url: string | null
          social_links: Json
          image_settings: Json
          privacy_policy: string | null
          terms_of_use: string | null
          seo_keywords: string | null
          seo_title_suffix: string | null
          not_found_title: string | null
          not_found_message: string | null
          email_settings: Json
          analytics_settings: Json
          map_settings: Json
          layout_settings: Json
          indexing_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_name?: string
          site_description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          logo_url?: string | null
          social_links?: Json
          image_settings?: Json
          privacy_policy?: string | null
          terms_of_use?: string | null
          seo_keywords?: string | null
          seo_title_suffix?: string | null
          not_found_title?: string | null
          not_found_message?: string | null
          email_settings?: Json
          analytics_settings?: Json
          map_settings?: Json
          layout_settings?: Json
          indexing_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          site_description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          logo_url?: string | null
          social_links?: Json
          image_settings?: Json
          privacy_policy?: string | null
          terms_of_use?: string | null
          seo_keywords?: string | null
          seo_title_suffix?: string | null
          not_found_title?: string | null
          not_found_message?: string | null
          email_settings?: Json
          analytics_settings?: Json
          map_settings?: Json
          layout_settings?: Json
          indexing_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          id: string
          metric_name: string
          value: number
          rating: string | null
          path: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          value: number
          rating?: string | null
          path?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          value?: number
          rating?: string | null
          path?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      system_modules: {
        Row: {
          id: string
          key: string
          name: string
          is_active: boolean
          is_sort_enabled: boolean
          order_position: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          name: string
          is_active?: boolean
          is_sort_enabled?: boolean
          order_position?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          name?: string
          is_active?: boolean
          is_sort_enabled?: boolean
          order_position?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_module_audit_logs: {
        Row: {
          id: string
          action: string
          module_key: string | null
          previous_state: Json
          next_state: Json
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          module_key?: string | null
          previous_state?: Json
          next_state?: Json
          changed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          module_key?: string | null
          previous_state?: Json
          next_state?: Json
          changed_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          action: string
          details: Json | null
          user_id: string | null
          path: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          details?: Json | null
          user_id?: string | null
          path?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          details?: Json | null
          user_id?: string | null
          path?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          id: string
          filename: string
          url: string
          size: number | null
          width: number | null
          height: number | null
          mime_type: string | null
          folder: string
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          url: string
          size?: number | null
          width?: number | null
          height?: number | null
          mime_type?: string | null
          folder?: string
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          url?: string
          size?: number | null
          width?: number | null
          height?: number | null
          mime_type?: string | null
          folder?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_system_modules_config: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          key: string
          name: string
          is_active: boolean
          is_sort_enabled: boolean
          order_position: number
          updated_at: string
          updated_by: string | null
        }[]
      }
      update_system_module_config: {
        Args: {
          p_key: string
          p_is_active: boolean
          p_is_sort_enabled: boolean
        }
        Returns: {
          id: string
          key: string
          name: string
          is_active: boolean
          is_sort_enabled: boolean
          order_position: number
          updated_at: string
          updated_by: string | null
        }
      }
      reorder_system_modules: {
        Args: {
          p_keys: string[]
        }
        Returns: {
          id: string
          key: string
          name: string
          is_active: boolean
          is_sort_enabled: boolean
          order_position: number
          updated_at: string
          updated_by: string | null
        }[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
