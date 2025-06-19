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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      drafted_players: {
        Row: {
          created_at: string
          drafted_player: number | null
          drafted_player_id: number
          drafted_team: number | null
        }
        Insert: {
          created_at?: string
          drafted_player?: number | null
          drafted_player_id?: number
          drafted_team?: number | null
        }
        Update: {
          created_at?: string
          drafted_player?: number | null
          drafted_player_id?: number
          drafted_team?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drafted_players_drafted_player_fkey"
            columns: ["drafted_player"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "drafted_players_drafted_player_fkey"
            columns: ["drafted_player"]
            isOneToOne: false
            referencedRelation: "players_view"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "drafted_players_drafted_team_fkey"
            columns: ["drafted_team"]
            isOneToOne: false
            referencedRelation: "drafted_teams"
            referencedColumns: ["drafted_team_id"]
          },
        ]
      }
      drafted_teams: {
        Row: {
          active_season: string
          allow_communication: boolean
          allowed_transfers: boolean
          contact_number: string | null
          created_at: string
          drafted_team_id: number
          edited_count: number | null
          key: string
          team_email: string
          team_name: string
          team_owner: string
          total_team_value: number | null
          updated_at: string | null
        }
        Insert: {
          active_season: string
          allow_communication?: boolean
          allowed_transfers: boolean
          contact_number?: string | null
          created_at?: string
          drafted_team_id?: number
          edited_count?: number | null
          key?: string
          team_email: string
          team_name: string
          team_owner: string
          total_team_value?: number | null
          updated_at?: string | null
        }
        Update: {
          active_season?: string
          allow_communication?: boolean
          allowed_transfers?: boolean
          contact_number?: string | null
          created_at?: string
          drafted_team_id?: number
          edited_count?: number | null
          key?: string
          team_email?: string
          team_name?: string
          team_owner?: string
          total_team_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      drafted_transfers: {
        Row: {
          active_transfer_expiry: string | null
          created_at: string
          drafted_player: number
          drafted_transfer_id: number
          player_id: number
          transfer_week: number | null
        }
        Insert: {
          active_transfer_expiry?: string | null
          created_at?: string
          drafted_player: number
          drafted_transfer_id?: number
          player_id: number
          transfer_week?: number | null
        }
        Update: {
          active_transfer_expiry?: string | null
          created_at?: string
          drafted_player?: number
          drafted_transfer_id?: number
          player_id?: number
          transfer_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drafted_transfers_drafted_player_fkey"
            columns: ["drafted_player"]
            isOneToOne: false
            referencedRelation: "drafted_players"
            referencedColumns: ["drafted_player_id"]
          },
          {
            foreignKeyName: "drafted_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "drafted_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_view"
            referencedColumns: ["player_id"]
          },
        ]
      }
      fixtures: {
        Row: {
          away_team: number | null
          away_team_score: number | null
          created_at: string
          game_week: number | null
          home_team: number | null
          home_team_score: number | null
          id: number
          populated_at: string | null
          populated_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          away_team?: number | null
          away_team_score?: number | null
          created_at?: string
          game_week?: number | null
          home_team?: number | null
          home_team_score?: number | null
          id?: number
          populated_at?: string | null
          populated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          away_team?: number | null
          away_team_score?: number | null
          created_at?: string
          game_week?: number | null
          home_team?: number | null
          home_team_score?: number | null
          id?: number
          populated_at?: string | null
          populated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_populated_by_fkey"
            columns: ["populated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_fixtures_away_team_fkey"
            columns: ["away_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_fixtures_home_team_fkey"
            columns: ["home_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_statistics: {
        Row: {
          assists: number | null
          author: string | null
          clean_sheet: boolean | null
          created_at: string
          fixture_id: number
          goals: number | null
          id: number
          player_id: number
          points: number
          red_card: boolean | null
        }
        Insert: {
          assists?: number | null
          author?: string | null
          clean_sheet?: boolean | null
          created_at?: string
          fixture_id: number
          goals?: number | null
          id?: number
          player_id: number
          points: number
          red_card?: boolean | null
        }
        Update: {
          assists?: number | null
          author?: string | null
          clean_sheet?: boolean | null
          created_at?: string
          fixture_id?: number
          goals?: number | null
          id?: number
          player_id?: number
          points?: number
          red_card?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "public_player_statistics_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_player_statistics_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "public_player_statistics_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_view"
            referencedColumns: ["player_id"]
          },
        ]
      }
      players: {
        Row: {
          assists: number | null
          bonus: number | null
          bps: number | null
          chance_of_playing_next_round: string | null
          chance_of_playing_this_round: string | null
          clean_sheets: number | null
          clean_sheets_per_90: string | null
          code: number
          corners_and_indirect_freekicks_order: string | null
          corners_and_indirect_freekicks_text: string | null
          cost_change_event: number | null
          cost_change_event_fall: number | null
          cost_change_start: number | null
          cost_change_start_fall: number | null
          created_at: string | null
          creativity: string | null
          creativity_rank: number | null
          creativity_rank_type: number | null
          direct_freekicks_order: string | null
          direct_freekicks_text: string | null
          dreamteam_count: number | null
          element_type: number | null
          ep_next: string | null
          ep_this: string | null
          event_points: number | null
          expected_assists: string | null
          expected_assists_per_90: string | null
          expected_goal_involvements: string | null
          expected_goal_involvements_per_90: string | null
          expected_goals: string | null
          expected_goals_conceded: string | null
          expected_goals_conceded_per_90: string | null
          expected_goals_per_90: string | null
          first_name: string | null
          form: string | null
          form_rank: number | null
          form_rank_type: number | null
          goals_conceded: number | null
          goals_conceded_per_90: string | null
          goals_scored: number | null
          ict_index: string | null
          ict_index_rank: number | null
          ict_index_rank_type: number | null
          in_dreamteam: boolean | null
          influence: string | null
          influence_rank: number | null
          influence_rank_type: number | null
          minutes: number | null
          news: string | null
          news_added: string | null
          now_cost: number | null
          now_cost_rank: number | null
          now_cost_rank_type: number | null
          own_goals: number | null
          penalties_missed: number | null
          penalties_order: string | null
          penalties_saved: number | null
          penalties_text: string | null
          photo: string | null
          player_id: number
          points_per_game: string | null
          points_per_game_rank: number | null
          points_per_game_rank_type: number | null
          red_cards: number | null
          saves: number | null
          saves_per_90: string | null
          second_name: string | null
          selected_by_percent: string | null
          selected_rank: number | null
          selected_rank_type: number | null
          special: boolean | null
          squad_number: string | null
          starts: number | null
          starts_per_90: string | null
          status: string | null
          team: number
          team_code: number | null
          threat: string | null
          threat_rank: number | null
          threat_rank_type: number | null
          total_points: number | null
          transfers_in: number | null
          transfers_in_event: number | null
          transfers_out: number | null
          transfers_out_event: number | null
          updated_at: string | null
          value_form: string | null
          value_season: string | null
          web_name: string | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          bonus?: number | null
          bps?: number | null
          chance_of_playing_next_round?: string | null
          chance_of_playing_this_round?: string | null
          clean_sheets?: number | null
          clean_sheets_per_90?: string | null
          code: number
          corners_and_indirect_freekicks_order?: string | null
          corners_and_indirect_freekicks_text?: string | null
          cost_change_event?: number | null
          cost_change_event_fall?: number | null
          cost_change_start?: number | null
          cost_change_start_fall?: number | null
          created_at?: string | null
          creativity?: string | null
          creativity_rank?: number | null
          creativity_rank_type?: number | null
          direct_freekicks_order?: string | null
          direct_freekicks_text?: string | null
          dreamteam_count?: number | null
          element_type?: number | null
          ep_next?: string | null
          ep_this?: string | null
          event_points?: number | null
          expected_assists?: string | null
          expected_assists_per_90?: string | null
          expected_goal_involvements?: string | null
          expected_goal_involvements_per_90?: string | null
          expected_goals?: string | null
          expected_goals_conceded?: string | null
          expected_goals_conceded_per_90?: string | null
          expected_goals_per_90?: string | null
          first_name?: string | null
          form?: string | null
          form_rank?: number | null
          form_rank_type?: number | null
          goals_conceded?: number | null
          goals_conceded_per_90?: string | null
          goals_scored?: number | null
          ict_index?: string | null
          ict_index_rank?: number | null
          ict_index_rank_type?: number | null
          in_dreamteam?: boolean | null
          influence?: string | null
          influence_rank?: number | null
          influence_rank_type?: number | null
          minutes?: number | null
          news?: string | null
          news_added?: string | null
          now_cost?: number | null
          now_cost_rank?: number | null
          now_cost_rank_type?: number | null
          own_goals?: number | null
          penalties_missed?: number | null
          penalties_order?: string | null
          penalties_saved?: number | null
          penalties_text?: string | null
          photo?: string | null
          player_id: number
          points_per_game?: string | null
          points_per_game_rank?: number | null
          points_per_game_rank_type?: number | null
          red_cards?: number | null
          saves?: number | null
          saves_per_90?: string | null
          second_name?: string | null
          selected_by_percent?: string | null
          selected_rank?: number | null
          selected_rank_type?: number | null
          special?: boolean | null
          squad_number?: string | null
          starts?: number | null
          starts_per_90?: string | null
          status?: string | null
          team: number
          team_code?: number | null
          threat?: string | null
          threat_rank?: number | null
          threat_rank_type?: number | null
          total_points?: number | null
          transfers_in?: number | null
          transfers_in_event?: number | null
          transfers_out?: number | null
          transfers_out_event?: number | null
          updated_at?: string | null
          value_form?: string | null
          value_season?: string | null
          web_name?: string | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          bonus?: number | null
          bps?: number | null
          chance_of_playing_next_round?: string | null
          chance_of_playing_this_round?: string | null
          clean_sheets?: number | null
          clean_sheets_per_90?: string | null
          code?: number
          corners_and_indirect_freekicks_order?: string | null
          corners_and_indirect_freekicks_text?: string | null
          cost_change_event?: number | null
          cost_change_event_fall?: number | null
          cost_change_start?: number | null
          cost_change_start_fall?: number | null
          created_at?: string | null
          creativity?: string | null
          creativity_rank?: number | null
          creativity_rank_type?: number | null
          direct_freekicks_order?: string | null
          direct_freekicks_text?: string | null
          dreamteam_count?: number | null
          element_type?: number | null
          ep_next?: string | null
          ep_this?: string | null
          event_points?: number | null
          expected_assists?: string | null
          expected_assists_per_90?: string | null
          expected_goal_involvements?: string | null
          expected_goal_involvements_per_90?: string | null
          expected_goals?: string | null
          expected_goals_conceded?: string | null
          expected_goals_conceded_per_90?: string | null
          expected_goals_per_90?: string | null
          first_name?: string | null
          form?: string | null
          form_rank?: number | null
          form_rank_type?: number | null
          goals_conceded?: number | null
          goals_conceded_per_90?: string | null
          goals_scored?: number | null
          ict_index?: string | null
          ict_index_rank?: number | null
          ict_index_rank_type?: number | null
          in_dreamteam?: boolean | null
          influence?: string | null
          influence_rank?: number | null
          influence_rank_type?: number | null
          minutes?: number | null
          news?: string | null
          news_added?: string | null
          now_cost?: number | null
          now_cost_rank?: number | null
          now_cost_rank_type?: number | null
          own_goals?: number | null
          penalties_missed?: number | null
          penalties_order?: string | null
          penalties_saved?: number | null
          penalties_text?: string | null
          photo?: string | null
          player_id?: number
          points_per_game?: string | null
          points_per_game_rank?: number | null
          points_per_game_rank_type?: number | null
          red_cards?: number | null
          saves?: number | null
          saves_per_90?: string | null
          second_name?: string | null
          selected_by_percent?: string | null
          selected_rank?: number | null
          selected_rank_type?: number | null
          special?: boolean | null
          squad_number?: string | null
          starts?: number | null
          starts_per_90?: string | null
          status?: string | null
          team?: number
          team_code?: number | null
          threat?: string | null
          threat_rank?: number | null
          threat_rank_type?: number | null
          total_points?: number | null
          transfers_in?: number | null
          transfers_in_event?: number | null
          transfers_out?: number | null
          transfers_out_event?: number | null
          updated_at?: string | null
          value_form?: string | null
          value_season?: string | null
          web_name?: string | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: number
          name: string | null
          short_name: string | null
        }
        Insert: {
          id: number
          name?: string | null
          short_name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
          short_name?: string | null
        }
        Relationships: []
      }
      weekly_statistics: {
        Row: {
          assists: number | null
          clean_sheets: number | null
          created_at: string
          goals: number | null
          id: number
          points: number
          red_cards: number | null
          team: number | null
          week: number
        }
        Insert: {
          assists?: number | null
          clean_sheets?: number | null
          created_at?: string
          goals?: number | null
          id?: number
          points: number
          red_cards?: number | null
          team?: number | null
          week: number
        }
        Update: {
          assists?: number | null
          clean_sheets?: number | null
          created_at?: string
          goals?: number | null
          id?: number
          points?: number
          red_cards?: number | null
          team?: number | null
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_weekly_statistics_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "drafted_teams"
            referencedColumns: ["drafted_team_id"]
          },
        ]
      }
    }
    Views: {
      players_view: {
        Row: {
          assists: number | null
          clean_sheets: number | null
          code: number | null
          cost: number | null
          first_name: string | null
          goals_scored: number | null
          image: string | null
          image_large: string | null
          is_unavailable: boolean | null
          minutes: number | null
          news: string | null
          player_id: number | null
          position: number | null
          red_cards: number | null
          second_name: string | null
          status: string | null
          team: number | null
          team_name: string | null
          team_short_name: string | null
          unavailable_for_season: boolean | null
          web_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_drafted_teams_and_players: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_drafted_teams_by_season: {
        Args: { active_season_param: string }
        Returns: Json
      }
      get_drafted_teams_with_player_points_by_gameweek: {
        Args: { game_week_param: number }
        Returns: {
          drafted_team_id: number
          team_name: string
          team_email: string
          team_owner: string
          allowed_transfers: boolean
          weekly_stats: Json
          players: Json
        }[]
      }
      get_drafted_teams_with_player_points_by_gameweek_2: {
        Args: { game_week_param: number }
        Returns: {
          drafted_team_id: number
          team_name: string
          team_email: string
          team_owner: string
          allowed_transfers: boolean
          weekly_stats: Json
          players: Json
        }[]
      }
      get_player_stats_by_team_id: {
        Args: { team_id_param: number }
        Returns: {
          player_id: number
          number_code: number
          image: string
          image_large: string
          web_name: string
          first_name: string
          second_name: string
          goals_scored: number
          assists: number
          clean_sheets: number
          red_cards: number
          cost: number
          status: string
          is_unavailable: boolean
          unavailable_for_season: boolean
          news: string
          position: number
          team: number
          team_name: string
          team_short_name: string
          minutes: number
          week_goals: number
          week_assists: number
          week_cleansheet: boolean
          week_redcard: boolean
        }[]
      }
      get_player_stats_by_team_id_for_fixture: {
        Args: { team_id_param: number; fixture_id_param: number }
        Returns: {
          player_id: number
          code: number
          image: string
          image_large: string
          web_name: string
          first_name: string
          second_name: string
          goals_scored: number
          assists: number
          clean_sheets: number
          red_cards: number
          cost: number
          status: string
          is_unavailable: boolean
          unavailable_for_season: boolean
          news: string
          position: number
          team: number
          team_name: string
          team_short_name: string
          minutes: number
          week_goals: number
          week_assists: number
          week_cleansheet: boolean
          week_redcard: boolean
        }[]
      }
      get_player_team: {
        Args: Record<PropertyKey, never>
        Returns: {
          web_name: string
          team_name: string
          team_id: number
        }[]
      }
      get_weekly_stats_for_gameweek: {
        Args: { target_week: number }
        Returns: {
          drafted_team_id: number
          team_name: string
          team_owner: string
          goals: number
          assists: number
          clean_sheets: number
          red_cards: number
          total_points: number
          week_points: number
          weekly_winner: boolean
          prev_week_position: number
        }[]
      }
      get_weekly_winners: {
        Args: Record<PropertyKey, never>
        Returns: {
          week: number
          top_teams: Json[]
          points: number
        }[]
      }
      insert_or_update_data: {
        Args: { id_field: number; other_field: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

