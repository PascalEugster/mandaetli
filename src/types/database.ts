export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      actors: {
        Row: {
          abbreviation: string | null
          actor_type: Database["public"]["Enums"]["actor_type"]
          canton: string | null
          color: string | null
          council: Database["public"]["Enums"]["council_type"] | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          founded: number | null
          gender: string | null
          headquarters: string | null
          id: string
          ideology_position: number | null
          industry: string | null
          language: string | null
          last_name: string | null
          legal_form: string | null
          metadata: Json
          name: string
          name_fr: string | null
          name_it: string | null
          party_id: string | null
          portrait_url: string | null
          seats_nr: number | null
          seats_sr: number | null
          slug: string
          uid: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          abbreviation?: string | null
          actor_type: Database["public"]["Enums"]["actor_type"]
          canton?: string | null
          color?: string | null
          council?: Database["public"]["Enums"]["council_type"] | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          founded?: number | null
          gender?: string | null
          headquarters?: string | null
          id?: string
          ideology_position?: number | null
          industry?: string | null
          language?: string | null
          last_name?: string | null
          legal_form?: string | null
          metadata?: Json
          name: string
          name_fr?: string | null
          name_it?: string | null
          party_id?: string | null
          portrait_url?: string | null
          seats_nr?: number | null
          seats_sr?: number | null
          slug: string
          uid?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          abbreviation?: string | null
          actor_type?: Database["public"]["Enums"]["actor_type"]
          canton?: string | null
          color?: string | null
          council?: Database["public"]["Enums"]["council_type"] | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          founded?: number | null
          gender?: string | null
          headquarters?: string | null
          id?: string
          ideology_position?: number | null
          industry?: string | null
          language?: string | null
          last_name?: string | null
          legal_form?: string | null
          metadata?: Json
          name?: string
          name_fr?: string | null
          name_it?: string | null
          party_id?: string | null
          portrait_url?: string | null
          seats_nr?: number | null
          seats_sr?: number | null
          slug?: string
          uid?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actors_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          confidence: Database["public"]["Enums"]["confidence_level"]
          connection_type: Database["public"]["Enums"]["connection_type"]
          created_at: string
          data_source_id: string | null
          id: string
          is_paid: boolean | null
          metadata: Json
          role: string
          role_fr: string | null
          role_it: string | null
          source_actor_id: string
          source_retrieved_at: string | null
          source_url: string | null
          target_actor_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          connection_type: Database["public"]["Enums"]["connection_type"]
          created_at?: string
          data_source_id?: string | null
          id?: string
          is_paid?: boolean | null
          metadata?: Json
          role?: string
          role_fr?: string | null
          role_it?: string | null
          source_actor_id: string
          source_retrieved_at?: string | null
          source_url?: string | null
          target_actor_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          connection_type?: Database["public"]["Enums"]["connection_type"]
          created_at?: string
          data_source_id?: string | null
          id?: string
          is_paid?: boolean | null
          metadata?: Json
          role?: string
          role_fr?: string | null
          role_it?: string | null
          source_actor_id?: string
          source_retrieved_at?: string | null
          source_url?: string | null
          target_actor_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_source_actor_id_fkey"
            columns: ["source_actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_target_actor_id_fkey"
            columns: ["target_actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          base_url: string
          created_at: string
          description: string
          display_name: string
          id: string
          last_synced_at: string | null
          name: string
          record_count: number
          sync_frequency_hours: number
          updated_at: string
        }
        Insert: {
          base_url?: string
          created_at?: string
          description?: string
          display_name: string
          id: string
          last_synced_at?: string | null
          name: string
          record_count?: number
          sync_frequency_hours?: number
          updated_at?: string
        }
        Update: {
          base_url?: string
          created_at?: string
          description?: string
          display_name?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          record_count?: number
          sync_frequency_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      vote_records: {
        Row: {
          actor_id: string
          decision: Database["public"]["Enums"]["vote_decision"]
          id: string
          vote_id: string
        }
        Insert: {
          actor_id: string
          decision: Database["public"]["Enums"]["vote_decision"]
          id?: string
          vote_id: string
        }
        Update: {
          actor_id?: string
          decision?: Database["public"]["Enums"]["vote_decision"]
          id?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_records_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_records_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "votes"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          affair_id: string | null
          affair_title: string
          affair_title_fr: string | null
          affair_title_it: string | null
          council: Database["public"]["Enums"]["council_type"]
          created_at: string
          description: string | null
          id: string
          topic_category: string | null
          vote_date: string
        }
        Insert: {
          affair_id?: string | null
          affair_title: string
          affair_title_fr?: string | null
          affair_title_it?: string | null
          council: Database["public"]["Enums"]["council_type"]
          created_at?: string
          description?: string | null
          id?: string
          topic_category?: string | null
          vote_date: string
        }
        Update: {
          affair_id?: string | null
          affair_title?: string
          affair_title_fr?: string | null
          affair_title_it?: string | null
          council?: Database["public"]["Enums"]["council_type"]
          created_at?: string
          description?: string | null
          id?: string
          topic_category?: string | null
          vote_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      actor_type: "person" | "organization" | "party"
      confidence_level: "verified" | "declared" | "media_reported" | "inferred"
      connection_type:
        | "mandate"
        | "membership"
        | "lobbying"
        | "donation"
        | "employment"
      council_type: "NR" | "SR"
      vote_decision: "yes" | "no" | "abstain" | "absent" | "not_participating"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      actor_type: ["person", "organization", "party"],
      confidence_level: ["verified", "declared", "media_reported", "inferred"],
      connection_type: [
        "mandate",
        "membership",
        "lobbying",
        "donation",
        "employment",
      ],
      council_type: ["NR", "SR"],
      vote_decision: ["yes", "no", "abstain", "absent", "not_participating"],
    },
  },
} as const

