export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          activity_id: string | null
          brand: string
          city: string | null
          client_id: string | null
          created_at: string | null
          created_by: string
          end_date: string | null
          id: string
          instructions: string | null
          location: string | null
          name: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["activity_status"] | null
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          brand: string
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          location?: string | null
          name?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["activity_status"] | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          brand?: string
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          location?: string | null
          name?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["activity_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      activity_assignments: {
        Row: {
          activity_id: string
          assigned_at: string | null
          id: string
          incentive: number | null
          instructions: string | null
          target: number
          vendor_id: string
        }
        Insert: {
          activity_id: string
          assigned_at?: string | null
          id?: string
          incentive?: number | null
          instructions?: string | null
          target: number
          vendor_id: string
        }
        Update: {
          activity_id?: string
          assigned_at?: string | null
          id?: string
          incentive?: number | null
          instructions?: string | null
          target?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_assignments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_assignments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clients: {
        Row: {
          brand_name: string
          city: string | null
          created_at: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_name: string
          city?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_name?: string
          city?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cupshup_admins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupshup_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string | null
          email: string
          name: string
          phone: number | null
          profile_photo: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email: string
          name: string
          phone?: number | null
          profile_photo?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string
          name?: string
          phone?: number | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          activity_id: string
          created_at: string | null
          customer_name: string
          customer_number: number
          id: string
          order_id: string | null
          order_image_url: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          customer_name: string
          customer_number: number
          id?: string
          order_id?: string | null
          order_image_url: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          customer_name?: string
          customer_number?: number
          id?: string
          order_id?: string | null
          order_image_url?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vendors: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          phone: string | null
          user_id: string
          vendor_name: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          user_id: string
          vendor_name: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          user_id?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_status: "pending" | "in_progress" | "completed" | "cancelled"
      brand_name_enum:
        | "Amazon"
        | "Flipkart"
        | "DCB Bank"
        | "Spencers"
        | "Tata 1mg"
        | "HDFC Life"
        | "Apnamart"
      city_enum:
        | "Delhi"
        | "Pune"
        | "Noida"
        | "Gurgaon"
        | "Mumbai"
        | "Bengaluru"
        | "Chennai"
        | "Jaipur"
        | "Ahmedabad"
        | "Kolkata"
        | "Lucknow"
      task_status: "pending" | "in_progress" | "done"
      user_role: "CupShup" | "Vendor" | "Client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type UserRole = 'Client' | 'Vendor' | 'Admin' | 'CupShup';
