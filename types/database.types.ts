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
      drafted_players: {
        Row: {
          created_at: string;
          drafted_player: number | null;
          drafted_player_id: number;
          drafted_team: number | null;
        };
        Insert: {
          created_at?: string;
          drafted_player?: number | null;
          drafted_player_id?: number;
          drafted_team?: number | null;
        };
        Update: {
          created_at?: string;
          drafted_player?: number | null;
          drafted_player_id?: number;
          drafted_team?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'drafted_players_drafted_player_fkey';
            columns: ['drafted_player'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drafted_players_drafted_player_fkey';
            columns: ['drafted_player'];
            isOneToOne: false;
            referencedRelation: 'players_view';
            referencedColumns: ['player_id'];
          },
          {
            foreignKeyName: 'drafted_players_drafted_team_fkey';
            columns: ['drafted_team'];
            isOneToOne: false;
            referencedRelation: 'drafted_teams';
            referencedColumns: ['drafted_team_id'];
          }
        ];
      };
      drafted_teams: {
        Row: {
          allowed_transfers: boolean;
          drafted_team_id: number;
          team_email: string;
          team_name: string;
          team_owner: string;
        };
        Insert: {
          allowed_transfers: boolean;
          drafted_team_id?: number;
          team_email: string;
          team_name: string;
          team_owner: string;
        };
        Update: {
          allowed_transfers?: boolean;
          drafted_team_id?: number;
          team_email?: string;
          team_name?: string;
          team_owner?: string;
        };
        Relationships: [];
      };
      drafted_transfers: {
        Row: {
          active_transfer_expiry: string | null;
          created_at: string;
          drafted_player_id: number | null;
          drafted_transfer_id: number;
          player_id: number | null;
          transfer_week: number | null;
        };
        Insert: {
          active_transfer_expiry?: string | null;
          created_at?: string;
          drafted_player_id?: number | null;
          drafted_transfer_id?: number;
          player_id?: number | null;
          transfer_week?: number | null;
        };
        Update: {
          active_transfer_expiry?: string | null;
          created_at?: string;
          drafted_player_id?: number | null;
          drafted_transfer_id?: number;
          player_id?: number | null;
          transfer_week?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'drafted_transfers_drafted_player_id_fkey';
            columns: ['drafted_player_id'];
            isOneToOne: false;
            referencedRelation: 'drafted_players';
            referencedColumns: ['drafted_player_id'];
          },
          {
            foreignKeyName: 'drafted_transfers_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drafted_transfers_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players_view';
            referencedColumns: ['player_id'];
          }
        ];
      };
      players: {
        Row: {
          assists: number | null;
          bonus: number | null;
          bps: number | null;
          chance_of_playing_next_round: string | null;
          chance_of_playing_this_round: string | null;
          clean_sheets: number | null;
          clean_sheets_per_90: string | null;
          code: number;
          corners_and_indirect_freekicks_order: string | null;
          corners_and_indirect_freekicks_text: string | null;
          cost_change_event: number | null;
          cost_change_event_fall: number | null;
          cost_change_start: number | null;
          cost_change_start_fall: number | null;
          created_at: string | null;
          creativity: string | null;
          creativity_rank: number | null;
          creativity_rank_type: number | null;
          direct_freekicks_order: string | null;
          direct_freekicks_text: string | null;
          dreamteam_count: number | null;
          element_type: number | null;
          ep_next: string | null;
          ep_this: string | null;
          event_points: number | null;
          expected_assists: string | null;
          expected_assists_per_90: string | null;
          expected_goal_involvements: string | null;
          expected_goal_involvements_per_90: string | null;
          expected_goals: string | null;
          expected_goals_conceded: string | null;
          expected_goals_conceded_per_90: string | null;
          expected_goals_per_90: string | null;
          first_name: string | null;
          form: string | null;
          form_rank: number | null;
          form_rank_type: number | null;
          goals_conceded: number | null;
          goals_conceded_per_90: string | null;
          goals_scored: number | null;
          ict_index: string | null;
          ict_index_rank: number | null;
          ict_index_rank_type: number | null;
          id: number;
          in_dreamteam: boolean | null;
          influence: string | null;
          influence_rank: number | null;
          influence_rank_type: number | null;
          minutes: number | null;
          news: string | null;
          news_added: string | null;
          now_cost: number | null;
          now_cost_rank: number | null;
          now_cost_rank_type: number | null;
          own_goals: number | null;
          penalties_missed: number | null;
          penalties_order: string | null;
          penalties_saved: number | null;
          penalties_text: string | null;
          photo: string | null;
          points_per_game: string | null;
          points_per_game_rank: number | null;
          points_per_game_rank_type: number | null;
          red_cards: number | null;
          saves: number | null;
          saves_per_90: string | null;
          second_name: string | null;
          selected_by_percent: string | null;
          selected_rank: number | null;
          selected_rank_type: number | null;
          special: boolean | null;
          squad_number: string | null;
          starts: number | null;
          starts_per_90: string | null;
          status: string | null;
          team: number;
          team_code: number | null;
          threat: string | null;
          threat_rank: number | null;
          threat_rank_type: number | null;
          total_points: number | null;
          transfers_in: number | null;
          transfers_in_event: number | null;
          transfers_out: number | null;
          transfers_out_event: number | null;
          updated_at: string | null;
          value_form: string | null;
          value_season: string | null;
          web_name: string | null;
          yellow_cards: number | null;
        };
        Insert: {
          assists?: number | null;
          bonus?: number | null;
          bps?: number | null;
          chance_of_playing_next_round?: string | null;
          chance_of_playing_this_round?: string | null;
          clean_sheets?: number | null;
          clean_sheets_per_90?: string | null;
          code: number;
          corners_and_indirect_freekicks_order?: string | null;
          corners_and_indirect_freekicks_text?: string | null;
          cost_change_event?: number | null;
          cost_change_event_fall?: number | null;
          cost_change_start?: number | null;
          cost_change_start_fall?: number | null;
          created_at?: string | null;
          creativity?: string | null;
          creativity_rank?: number | null;
          creativity_rank_type?: number | null;
          direct_freekicks_order?: string | null;
          direct_freekicks_text?: string | null;
          dreamteam_count?: number | null;
          element_type?: number | null;
          ep_next?: string | null;
          ep_this?: string | null;
          event_points?: number | null;
          expected_assists?: string | null;
          expected_assists_per_90?: string | null;
          expected_goal_involvements?: string | null;
          expected_goal_involvements_per_90?: string | null;
          expected_goals?: string | null;
          expected_goals_conceded?: string | null;
          expected_goals_conceded_per_90?: string | null;
          expected_goals_per_90?: string | null;
          first_name?: string | null;
          form?: string | null;
          form_rank?: number | null;
          form_rank_type?: number | null;
          goals_conceded?: number | null;
          goals_conceded_per_90?: string | null;
          goals_scored?: number | null;
          ict_index?: string | null;
          ict_index_rank?: number | null;
          ict_index_rank_type?: number | null;
          id: number;
          in_dreamteam?: boolean | null;
          influence?: string | null;
          influence_rank?: number | null;
          influence_rank_type?: number | null;
          minutes?: number | null;
          news?: string | null;
          news_added?: string | null;
          now_cost?: number | null;
          now_cost_rank?: number | null;
          now_cost_rank_type?: number | null;
          own_goals?: number | null;
          penalties_missed?: number | null;
          penalties_order?: string | null;
          penalties_saved?: number | null;
          penalties_text?: string | null;
          photo?: string | null;
          points_per_game?: string | null;
          points_per_game_rank?: number | null;
          points_per_game_rank_type?: number | null;
          red_cards?: number | null;
          saves?: number | null;
          saves_per_90?: string | null;
          second_name?: string | null;
          selected_by_percent?: string | null;
          selected_rank?: number | null;
          selected_rank_type?: number | null;
          special?: boolean | null;
          squad_number?: string | null;
          starts?: number | null;
          starts_per_90?: string | null;
          status?: string | null;
          team: number;
          team_code?: number | null;
          threat?: string | null;
          threat_rank?: number | null;
          threat_rank_type?: number | null;
          total_points?: number | null;
          transfers_in?: number | null;
          transfers_in_event?: number | null;
          transfers_out?: number | null;
          transfers_out_event?: number | null;
          updated_at?: string | null;
          value_form?: string | null;
          value_season?: string | null;
          web_name?: string | null;
          yellow_cards?: number | null;
        };
        Update: {
          assists?: number | null;
          bonus?: number | null;
          bps?: number | null;
          chance_of_playing_next_round?: string | null;
          chance_of_playing_this_round?: string | null;
          clean_sheets?: number | null;
          clean_sheets_per_90?: string | null;
          code?: number;
          corners_and_indirect_freekicks_order?: string | null;
          corners_and_indirect_freekicks_text?: string | null;
          cost_change_event?: number | null;
          cost_change_event_fall?: number | null;
          cost_change_start?: number | null;
          cost_change_start_fall?: number | null;
          created_at?: string | null;
          creativity?: string | null;
          creativity_rank?: number | null;
          creativity_rank_type?: number | null;
          direct_freekicks_order?: string | null;
          direct_freekicks_text?: string | null;
          dreamteam_count?: number | null;
          element_type?: number | null;
          ep_next?: string | null;
          ep_this?: string | null;
          event_points?: number | null;
          expected_assists?: string | null;
          expected_assists_per_90?: string | null;
          expected_goal_involvements?: string | null;
          expected_goal_involvements_per_90?: string | null;
          expected_goals?: string | null;
          expected_goals_conceded?: string | null;
          expected_goals_conceded_per_90?: string | null;
          expected_goals_per_90?: string | null;
          first_name?: string | null;
          form?: string | null;
          form_rank?: number | null;
          form_rank_type?: number | null;
          goals_conceded?: number | null;
          goals_conceded_per_90?: string | null;
          goals_scored?: number | null;
          ict_index?: string | null;
          ict_index_rank?: number | null;
          ict_index_rank_type?: number | null;
          id?: number;
          in_dreamteam?: boolean | null;
          influence?: string | null;
          influence_rank?: number | null;
          influence_rank_type?: number | null;
          minutes?: number | null;
          news?: string | null;
          news_added?: string | null;
          now_cost?: number | null;
          now_cost_rank?: number | null;
          now_cost_rank_type?: number | null;
          own_goals?: number | null;
          penalties_missed?: number | null;
          penalties_order?: string | null;
          penalties_saved?: number | null;
          penalties_text?: string | null;
          photo?: string | null;
          points_per_game?: string | null;
          points_per_game_rank?: number | null;
          points_per_game_rank_type?: number | null;
          red_cards?: number | null;
          saves?: number | null;
          saves_per_90?: string | null;
          second_name?: string | null;
          selected_by_percent?: string | null;
          selected_rank?: number | null;
          selected_rank_type?: number | null;
          special?: boolean | null;
          squad_number?: string | null;
          starts?: number | null;
          starts_per_90?: string | null;
          status?: string | null;
          team?: number;
          team_code?: number | null;
          threat?: string | null;
          threat_rank?: number | null;
          threat_rank_type?: number | null;
          total_points?: number | null;
          transfers_in?: number | null;
          transfers_in_event?: number | null;
          transfers_out?: number | null;
          transfers_out_event?: number | null;
          updated_at?: string | null;
          value_form?: string | null;
          value_season?: string | null;
          web_name?: string | null;
          yellow_cards?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'players_team_fkey';
            columns: ['team'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      teams: {
        Row: {
          code: number;
          draw: number | null;
          form: string | null;
          id: number;
          loss: number | null;
          name: string | null;
          played: number | null;
          points: number | null;
          position: number | null;
          pulse_id: number | null;
          short_name: string | null;
          strength: number | null;
          strength_attack_away: number | null;
          strength_attack_home: number | null;
          strength_defence_away: number | null;
          strength_defence_home: number | null;
          strength_overall_away: number | null;
          strength_overall_home: number | null;
          team_division: string | null;
          unavailable: boolean | null;
          win: number | null;
        };
        Insert: {
          code: number;
          draw?: number | null;
          form?: string | null;
          id: number;
          loss?: number | null;
          name?: string | null;
          played?: number | null;
          points?: number | null;
          position?: number | null;
          pulse_id?: number | null;
          short_name?: string | null;
          strength?: number | null;
          strength_attack_away?: number | null;
          strength_attack_home?: number | null;
          strength_defence_away?: number | null;
          strength_defence_home?: number | null;
          strength_overall_away?: number | null;
          strength_overall_home?: number | null;
          team_division?: string | null;
          unavailable?: boolean | null;
          win?: number | null;
        };
        Update: {
          code?: number;
          draw?: number | null;
          form?: string | null;
          id?: number;
          loss?: number | null;
          name?: string | null;
          played?: number | null;
          points?: number | null;
          position?: number | null;
          pulse_id?: number | null;
          short_name?: string | null;
          strength?: number | null;
          strength_attack_away?: number | null;
          strength_attack_home?: number | null;
          strength_defence_away?: number | null;
          strength_defence_home?: number | null;
          strength_overall_away?: number | null;
          strength_overall_home?: number | null;
          team_division?: string | null;
          unavailable?: boolean | null;
          win?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      players_view: {
        Row: {
          assists: number | null;
          clean_sheets: number | null;
          code: number | null;
          cost: string | null;
          first_name: string | null;
          goals_scored: number | null;
          image: string | null;
          image_large: string | null;
          is_unavailable: boolean | null;
          news: string | null;
          player_id: number | null;
          position: number | null;
          red_cards: number | null;
          second_name: string | null;
          status: string | null;
          team: number | null;
          team_name: string | null;
          team_short_name: string | null;
          unavailable_for_season: boolean | null;
          web_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'players_team_fkey';
            columns: ['team'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Functions: {
      get_player_data: {
        Args: Record<PropertyKey, never>;
        Returns: {
          web_name: string;
          team_name: string;
          team_id: number;
        }[];
      };
      get_player_team: {
        Args: Record<PropertyKey, never>;
        Returns: {
          web_name: string;
          team_name: string;
          team_id: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never;
