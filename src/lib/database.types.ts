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
      bookings: {
        Row: {
          booked_at: string
          flight_id: string
          id: string
          pnr_code: string
          seat_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
        }
        Insert: {
          booked_at?: string
          flight_id: string
          id?: string
          pnr_code: string
          seat_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
        }
        Update: {
          booked_at?: string
          flight_id?: string
          id?: string
          pnr_code?: string
          seat_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          aircraft_type: string
          arrives_at: string
          base_price: number
          created_at: string
          departs_at: string
          destination: string
          flight_no: string
          id: string
          origin: string
          status: Database["public"]["Enums"]["flight_status"]
        }
        Insert: {
          aircraft_type?: string
          arrives_at: string
          base_price: number
          created_at?: string
          departs_at: string
          destination: string
          flight_no: string
          id?: string
          origin: string
          status?: Database["public"]["Enums"]["flight_status"]
        }
        Update: {
          aircraft_type?: string
          arrives_at?: string
          base_price?: number
          created_at?: string
          departs_at?: string
          destination?: string
          flight_no?: string
          id?: string
          origin?: string
          status?: Database["public"]["Enums"]["flight_status"]
        }
        Relationships: []
      }
      passengers: {
        Row: {
          booking_id: string
          dob: string
          full_name: string
          id: string
          nationality: string
          passport_no: string
        }
        Insert: {
          booking_id: string
          dob: string
          full_name: string
          id?: string
          nationality: string
          passport_no: string
        }
        Update: {
          booking_id?: string
          dob?: string
          full_name?: string
          id?: string
          nationality?: string
          passport_no?: string
        }
        Relationships: [
          {
            foreignKeyName: "passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedules: {
        Row: {
          booking_id: string
          fee_charged: number
          id: string
          new_flight_id: string
          old_flight_id: string
          requested_at: string
        }
        Insert: {
          booking_id: string
          fee_charged?: number
          id?: string
          new_flight_id: string
          old_flight_id: string
          requested_at?: string
        }
        Update: {
          booking_id?: string
          fee_charged?: number
          id?: string
          new_flight_id?: string
          old_flight_id?: string
          requested_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedules_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedules_new_flight_id_fkey"
            columns: ["new_flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedules_old_flight_id_fkey"
            columns: ["old_flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          class: Database["public"]["Enums"]["seat_class"]
          extra_fee: number
          flight_id: string
          id: string
          is_available: boolean
          seat_number: string
        }
        Insert: {
          class?: Database["public"]["Enums"]["seat_class"]
          extra_fee?: number
          flight_id: string
          id?: string
          is_available?: boolean
          seat_number: string
        }
        Update: {
          class?: Database["public"]["Enums"]["seat_class"]
          extra_fee?: number
          flight_id?: string
          id?: string
          is_available?: boolean
          seat_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_seat: {
        Args: { p_flight_id: string; p_passengers: Json; p_seat_id: string }
        Returns: {
          booked_at: string
          flight_id: string
          id: string
          pnr_code: string
          seat_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
        }
      }
      cancel_booking: {
        Args: { p_booking_id: string }
        Returns: {
          booked_at: string
          flight_id: string
          id: string
          pnr_code: string
          seat_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
        }
      }
      generate_pnr: { Args: Record<string, never>; Returns: string }
      reschedule_booking: {
        Args: {
          p_booking_id: string
          p_new_flight_id: string
          p_new_seat_id: string
        }
        Returns: {
          booked_at: string
          flight_id: string
          id: string
          pnr_code: string
          seat_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
        }
      }
    }
    Enums: {
      booking_status: "confirmed" | "rescheduled" | "cancelled"
      flight_status:
        | "scheduled"
        | "boarding"
        | "departed"
        | "arrived"
        | "cancelled"
        | "delayed"
      seat_class: "economy" | "business" | "first"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Database

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
      booking_status: ["confirmed", "rescheduled", "cancelled"],
      flight_status: [
        "scheduled",
        "boarding",
        "departed",
        "arrived",
        "cancelled",
        "delayed",
      ],
      seat_class: ["economy", "business", "first"],
    },
  },
} as const
