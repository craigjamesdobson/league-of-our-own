import { createInterface } from 'node:readline/promises';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../app/types/database.types';
import {
  buildPreviousSeasonStatisticsRows,
  fetchPreviousSeasonStatistics,
} from '../server/utils/fplPreviousSeason';

const promptForSecret = async (question: string): Promise<string> => {
  if (!process.stdin.isTTY || !process.stdout.isTTY || !process.stdin.setRawMode) {
    throw new Error('The service-role key must be entered from an interactive terminal');
  }

  return new Promise((resolve, reject) => {
    let value = '';
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode?.(wasRaw ?? false);
      stdin.pause();
    };

    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString()) {
        if (character === '\u0003') {
          cleanup();
          process.stdout.write('\n');
          reject(new Error('Input cancelled'));
          return;
        }

        if (character === '\r' || character === '\n') {
          cleanup();
          process.stdout.write('\n');
          resolve(value);
          return;
        }

        if (character === '\u007f') {
          value = value.slice(0, -1);
          continue;
        }

        value += character;
      }
    };

    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
};

const syncPreviousSeasonStatistics = async () => {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  const supabaseUrl = (await readline.question('Target Supabase URL: ')).trim().replace(/\/$/, '');
  readline.close();

  if (!/^https?:\/\//.test(supabaseUrl)) {
    throw new Error('The Supabase URL must start with http:// or https://');
  }

  const serviceRoleKey = await promptForSecret('Target Supabase service-role key: ');

  if (!serviceRoleKey) {
    throw new Error('The Supabase service-role key cannot be blank');
  }

  console.log('Fetching previous-season statistics from FPL...');
  const statistics = await fetchPreviousSeasonStatistics();
  const rows = buildPreviousSeasonStatisticsRows(statistics, new Date().toISOString());
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase
    .from('player_previous_season_statistics')
    .upsert(rows, { onConflict: 'player_id' });

  if (error) {
    throw new Error(`Database upsert failed: ${error.message}`);
  }

  console.log(`Successfully synced previous-season statistics for ${rows.length} players.`);
};

try {
  await syncPreviousSeasonStatistics();
}
catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Previous-season statistics sync failed',
  );
  process.exitCode = 1;
}
