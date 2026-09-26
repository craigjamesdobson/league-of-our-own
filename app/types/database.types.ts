import type { MergeDeep } from 'type-fest';
import type { Database as DatabaseGenerated, Json } from './database-generated.types';
import type { DraftedTeamWithPlayers } from './DraftedTeam';

export type { Json } from './database-generated.types';

// Type for the database function that returns teams with players
// This provides proper TypeScript typing for the players field (instead of generic Json)
// Note: weekly_stats removed - calculated client-side now instead of using placeholder values
type DraftedTeamWithPlayerPointsByGameweek = DraftedTeamWithPlayers;

type PlayerPreviousSeasonStatisticsTable = {
  Row: {
    assists: number;
    clean_sheets: number;
    goals: number;
    minutes: number;
    player_id: number;
    points: number;
    red_cards: number;
    season_name: string | null;
    synced_at: string;
  };
  Insert: {
    assists?: number;
    clean_sheets?: number;
    goals?: number;
    minutes?: number;
    player_id: number;
    points?: number;
    red_cards?: number;
    season_name?: string | null;
    synced_at?: string;
  };
  Update: {
    assists?: number;
    clean_sheets?: number;
    goals?: number;
    minutes?: number;
    player_id?: number;
    points?: number;
    red_cards?: number;
    season_name?: string | null;
    synced_at?: string;
  };
  Relationships: [];
};

type DatabaseWithPlayerPreviousSeasonStatistics = DatabaseGenerated & {
  public: {
    Tables: DatabaseGenerated['public']['Tables'] & {
      player_previous_season_statistics: PlayerPreviousSeasonStatisticsTable;
      transfer_requests: TransferRequestsTable;
      transfer_request_items: TransferRequestItemsTable;
    };
    Functions: DatabaseGenerated['public']['Functions'] & {
      save_transfer_request: {
        Args: {
          p_active_season: string;
          p_drafted_team_id: number;
          p_items: Json;
          p_requester_email: string;
          p_requester_name: string;
          p_team_name: string;
          p_team_key: string;
          p_target_gameweek: number;
          p_transfer_request_id?: number | null;
        };
        Returns: TransferRequestRow;
      };
      approve_transfer_request: {
        Args: {
          p_transfer_request_id: number;
        };
        Returns: TransferRequestRow;
      };
      reject_transfer_request: {
        Args: {
          p_transfer_request_id: number;
        };
        Returns: TransferRequestRow;
      };
      cancel_transfer_request: {
        Args: {
          p_team_key: string;
          p_transfer_request_id: number;
        };
        Returns: TransferRequestRow;
      };
      cancel_transfer_request_item: {
        Args: {
          p_team_key: string;
          p_transfer_number: number;
          p_transfer_request_id: number;
        };
        Returns: TransferRequestRow;
      };
    };
  };
};

type TransferRequestRow = {
  transfer_request_id: number;
  drafted_team_id: number;
  active_season: string;
  requester_name: string;
  requester_email: string;
  target_gameweek: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  cancelled_at: string | null;
};

type TransferRequestsTable = {
  Row: TransferRequestRow;
  Insert: Omit<TransferRequestRow, 'transfer_request_id' | 'created_at' | 'reviewed_at' | 'reviewed_by' | 'cancelled_at'> & {
    transfer_request_id?: number;
    created_at?: string;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
    cancelled_at?: string | null;
  };
  Update: Partial<Pick<TransferRequestRow, 'status' | 'reviewed_at' | 'reviewed_by' | 'cancelled_at'>>;
  Relationships: [];
};

type TransferRequestItemsTable = {
  Row: {
    transfer_request_item_id: number;
    transfer_request_id: number;
    transfer_number: number;
    drafted_player_id: number;
    player_id: number;
    player_out: string;
    player_in: string;
  };
  Insert: {
    transfer_request_item_id?: number;
    transfer_request_id: number;
    transfer_number: number;
    drafted_player_id: number;
    player_id: number;
    player_out: string;
    player_in: string;
  };
  Update: Partial<TransferRequestItemsTable['Insert']>;
  Relationships: [];
};

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseWithPlayerPreviousSeasonStatistics,
  {
    public: {
      Functions: {
        get_drafted_teams_by_season: {
          Returns: DraftedTeamWithPlayers[];
        };
        get_drafted_teams_with_player_points_by_gameweek: {
          Returns: DraftedTeamWithPlayerPointsByGameweek[];
        };
      };
      Tables: {
        drafted_teams: {
          Row: {
            total_team_value: number; // Override to make non-nullable
          };
          Insert: {
            total_team_value: number; // Override to make non-nullable for inserts
          };
          Update: {
            total_team_value?: number; // Override to make non-nullable for updates
          };
        };
      };
      Views: {
        players_view: {
          Row: {
            assists: number;
            clean_sheets: number;
            code: number;
            cost: number;
            first_name: string;
            goals_scored: number;
            image: string;
            image_large: string;
            is_unavailable: boolean;
            news: string;
            player_id: number;
            total_points: number;
            position: number;
            red_cards: number;
            second_name: string;
            status: string;
            team: number;
            team_name: string;
            team_short_name: string;
            unavailable_for_season: boolean;
            web_name: string;
          };
        };
      };
    };
  }
>;

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables']
      & Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables']
    & Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables']
    & PublicSchema['Views'])
    ? (PublicSchema['Tables']
      & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I;
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U;
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type { DraftedTeamWithPlayerPointsByGameweek };
