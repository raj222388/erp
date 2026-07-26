export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          body: string | null
          created_at: string
          display_order: number
          icon: string | null
          id: string
          image_url: string | null
          is_published: boolean
          section_key: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          section_key: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          section_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classrooms: {
        Row: {
          capacity: number | null
          class_teacher_id: string | null
          created_at: string
          description: string | null
          display_order: number
          facilities: string | null
          grade: string | null
          id: string
          images: string[] | null
          is_visible: boolean
          name: string
          section: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          facilities?: string | null
          grade?: string | null
          id?: string
          images?: string[] | null
          is_visible?: boolean
          name: string
          section?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          facilities?: string | null
          grade?: string | null
          id?: string
          images?: string[] | null
          is_visible?: boolean
          name?: string
          section?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      downloads: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          file_url: string
          id: string
          is_visible: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          file_url: string
          id?: string
          is_visible?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          file_url?: string
          id?: string
          is_visible?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          gallery: string[] | null
          id: string
          is_archived: boolean
          is_featured: boolean
          is_published: boolean
          poster_url: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          gallery?: string[] | null
          id?: string
          is_archived?: boolean
          is_featured?: boolean
          is_published?: boolean
          poster_url?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          gallery?: string[] | null
          id?: string
          is_archived?: boolean
          is_featured?: boolean
          is_published?: boolean
          poster_url?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image_url: string | null
          is_visible: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number
          event_date: string | null
          id: string
          is_visible: boolean
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          event_date?: string | null
          id?: string
          is_visible?: boolean
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          event_date?: string | null
          id?: string
          is_visible?: boolean
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          album_id: string | null
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_visible: boolean
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_visible?: boolean
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_href: string | null
          cta_label: string | null
          display_order: number
          id: string
          image_url: string
          is_visible: boolean
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_visible?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_visible?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string | null
          created_at: string
          expires_at: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_published: boolean
          priority: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          priority?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          priority?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          analytics_code: string | null
          announcement_active: boolean
          announcement_bar: string | null
          copyright: string | null
          created_at: string
          director_message: string | null
          director_name: string | null
          director_photo_url: string | null
          email: string | null
          facebook_url: string | null
          favicon_url: string | null
          footer_text: string | null
          google_map_embed: string | null
          google_map_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          motto: string | null
          office_hours: string | null
          og_image_url: string | null
          phone: string | null
          primary_color: string | null
          principal_message: string | null
          principal_name: string | null
          principal_photo_url: string | null
          school_name: string
          secondary_color: string | null
          twitter_url: string | null
          updated_at: string
          welcome_message: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          analytics_code?: string | null
          announcement_active?: boolean
          announcement_bar?: string | null
          copyright?: string | null
          created_at?: string
          director_message?: string | null
          director_name?: string | null
          director_photo_url?: string | null
          email?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          google_map_embed?: string | null
          google_map_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          motto?: string | null
          office_hours?: string | null
          og_image_url?: string | null
          phone?: string | null
          primary_color?: string | null
          principal_message?: string | null
          principal_name?: string | null
          principal_photo_url?: string | null
          school_name?: string
          secondary_color?: string | null
          twitter_url?: string | null
          updated_at?: string
          welcome_message?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          analytics_code?: string | null
          announcement_active?: boolean
          announcement_bar?: string | null
          copyright?: string | null
          created_at?: string
          director_message?: string | null
          director_name?: string | null
          director_photo_url?: string | null
          email?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          google_map_embed?: string | null
          google_map_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          motto?: string | null
          office_hours?: string | null
          og_image_url?: string | null
          phone?: string | null
          primary_color?: string | null
          principal_message?: string | null
          principal_name?: string | null
          principal_photo_url?: string | null
          school_name?: string
          secondary_color?: string | null
          twitter_url?: string | null
          updated_at?: string
          welcome_message?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_date: string | null
          admission_no: string | null
          blood_group: string | null
          classroom_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          father_email: string | null
          father_name: string | null
          father_occupation: string | null
          father_phone: string | null
          father_photo_url: string | null
          first_name: string
          gender: string | null
          grade: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_active: boolean
          last_name: string | null
          mother_email: string | null
          mother_name: string | null
          mother_occupation: string | null
          mother_phone: string | null
          mother_photo_url: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          previous_school: string | null
          qr_token: string
          roll_no: string | null
          section: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          admission_no?: string | null
          blood_group?: string | null
          classroom_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          father_photo_url?: string | null
          first_name: string
          gender?: string | null
          grade?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          mother_photo_url?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          previous_school?: string | null
          qr_token?: string
          roll_no?: string | null
          section?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          admission_no?: string | null
          blood_group?: string | null
          classroom_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_phone?: string | null
          father_photo_url?: string | null
          first_name?: string
          gender?: string | null
          grade?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_phone?: string | null
          mother_photo_url?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          previous_school?: string | null
          qr_token?: string
          roll_no?: string | null
          section?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          achievements: string | null
          address: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          designation: string | null
          display_order: number
          email: string | null
          experience: string | null
          id: string
          is_featured: boolean
          is_visible: boolean
          joined_date: string | null
          name: string
          phone: string | null
          photo_url: string | null
          qr_token: string
          qualification: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          achievements?: string | null
          address?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          display_order?: number
          email?: string | null
          experience?: string | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          joined_date?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          qr_token?: string
          qualification?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: string | null
          address?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          display_order?: number
          email?: string | null
          experience?: string | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          joined_date?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          qr_token?: string
          qualification?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          message: string
          name: string
          photo_url: string | null
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          message: string
          name: string
          photo_url?: string | null
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          message?: string
          name?: string
          photo_url?: string | null
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_visible: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
