import type { MergeDeep } from 'type-fest';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database as DatabaseGenerated } from './database-generated.types';
export type { Json } from './database-generated.types';

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
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

export type TableRows<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TableInserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }>
  ? Exclude<U, null>
  : never;
export type DbResultErr = PostgrestError;
