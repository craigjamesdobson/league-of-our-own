# Team Builder Technical Specifications

## Architecture Overview

The team builder system follows a composable-based architecture with clear separation of concerns between data management, business logic, and presentation components.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Pages Layer                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              pages/team-builder/index.vue                   ││
│  │  - Route handling                                           ││
│  │  - Query parameter management                               ││
│  │  - Component orchestration                                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Composables Layer                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              composables/useTeamBuilder.ts                  ││
│  │  - Data fetching and caching                                ││
│  │  - Business logic                                           ││
│  │  - State management                                         ││
│  │  - Error handling                                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Components Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │         components/TeamBuilder/TeamBuilderForm.vue          ││
│  │         components/PlayerSection.vue                        ││
│  │  - Presentation logic                                       ││
│  │  - User interactions                                        ││
│  │  - Form handling                                            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Supabase Client                                ││
│  │  - Database operations                                      ││
│  │  - Real-time subscriptions                                 ││
│  │  - Authentication                                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Type Definitions

### Core Types

#### DraftedTeamPlayer
```typescript
// types/DraftedTeamPlayer.ts
import type { Player } from './Player';
import type { PlayerPosition } from './PlayerPosition';

export interface DraftedTeamPlayer {
  /** Database ID for existing drafted players */
  draftedPlayerID?: number;
  /** Player position (GK, DEF, MID, FWD) */
  position: PlayerPosition;
  /** Selected player data, null if slot is empty */
  selectedPlayer: Player | null;
}
```

#### TeamStructure
```typescript
// types/TeamStructure.ts
import type { PlayerPosition } from './PlayerPosition';

export interface TeamStructureItem {
  position: PlayerPosition;
  count: number;
}

export type TeamStructure = TeamStructureItem[];

export const DEFAULT_TEAM_STRUCTURE: TeamStructure = [
  { position: PlayerPosition.GOALKEEPER, count: 1 },
  { position: PlayerPosition.DEFENDER, count: 4 },
  { position: PlayerPosition.MIDFIELDER, count: 3 },
  { position: PlayerPosition.FORWARD, count: 3 },
];
```

#### TeamBuilderState
```typescript
// types/TeamBuilderState.ts
import type { DraftedTeamPlayer } from './DraftedTeamPlayer';
import type { TablesInsert } from './database-generated.types';

export interface TeamBuilderState {
  draftedTeamData: TablesInsert<'drafted_teams'>;
  draftedTeamPlayers: DraftedTeamPlayer[];
  loading: {
    fetchingTeam: boolean;
    submittingForm: boolean;
    loadingPlayers: boolean;
  };
  error: string | null;
}
```

### Computed Properties Types

#### BudgetCalculation
```typescript
// types/BudgetCalculation.ts
export interface BudgetCalculation {
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  isOverBudget: boolean;
}
```

#### ValidationResult
```typescript
// types/ValidationResult.ts
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'budget' | 'team_incomplete';
}
```

## Composable Architecture

### useTeamBuilder Composable

#### Interface
```typescript
// composables/useTeamBuilder.ts
export interface UseTeamBuilderReturn {
  // State
  readonly loading: Readonly<Ref<LoadingState>>;
  readonly error: Readonly<Ref<string | null>>;
  readonly draftedTeamData: Ref<TablesInsert<'drafted_teams'>>;
  readonly draftedTeamPlayers: Ref<DraftedTeamPlayer[]>;
  
  // Computed
  readonly isExistingTeam: ComputedRef<boolean>;
  readonly selectedPlayerIds: ComputedRef<number[]>;
  readonly budgetCalculation: ComputedRef<BudgetCalculation>;
  readonly validationResult: ComputedRef<ValidationResult>;
  
  // Methods
  fetchTeamData: (id: string) => Promise<void>;
  setTeamPlayers: (structure: TeamStructure, players?: Player[]) => void;
  selectPlayer: (index: number, player: Player | null) => void;
  submitTeam: () => Promise<void>;
  resetForm: () => void;
}

interface LoadingState {
  fetchingTeam: boolean;
  submittingForm: boolean;
  loadingPlayers: boolean;
}
```

#### Implementation Structure
```typescript
// composables/useTeamBuilder.ts
import { ref, computed, readonly } from 'vue';
import type { UseTeamBuilderReturn } from './types';

export const useTeamBuilder = (): UseTeamBuilderReturn => {
  // Internal state
  const loading = ref<LoadingState>({
    fetchingTeam: false,
    submittingForm: false,
    loadingPlayers: false
  });
  
  const error = ref<string | null>(null);
  const draftedTeamData = ref<TablesInsert<'drafted_teams'>>(createEmptyTeamData());
  const draftedTeamPlayers = ref<DraftedTeamPlayer[]>([]);
  
  // Computed properties
  const isExistingTeam = computed(() => !!draftedTeamData.value.key);
  
  const selectedPlayerIds = computed(() => {
    return draftedTeamPlayers.value
      .filter(player => player.selectedPlayer !== null)
      .map(player => player.selectedPlayer!.player_id);
  });
  
  const budgetCalculation = computed((): BudgetCalculation => {
    const totalBudget = draftedTeamData.value.allowed_transfers ? 85 : 90;
    const usedBudget = draftedTeamPlayers.value.reduce(
      (sum, player) => sum + (player.selectedPlayer?.cost ?? 0),
      0
    );
    const remainingBudget = totalBudget - usedBudget;
    
    return {
      totalBudget,
      usedBudget,
      remainingBudget,
      isOverBudget: remainingBudget < 0
    };
  });
  
  const validationResult = computed((): ValidationResult => {
    const errors: ValidationError[] = [];
    
    // Check required fields
    if (!draftedTeamData.value.team_name) {
      errors.push({ field: 'team_name', message: 'Team name is required', type: 'required' });
    }
    
    // Check team completion
    const hasEmptySlots = draftedTeamPlayers.value.some(player => player.selectedPlayer === null);
    if (hasEmptySlots) {
      errors.push({ 
        field: 'team', 
        message: 'Please select all players before submitting', 
        type: 'team_incomplete' 
      });
    }
    
    // Check budget
    if (budgetCalculation.value.isOverBudget) {
      errors.push({ 
        field: 'budget', 
        message: 'Your team is over budget', 
        type: 'budget' 
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  });
  
  // Methods
  const fetchTeamData = async (id: string): Promise<void> => {
    try {
      loading.value.fetchingTeam = true;
      error.value = null;
      
      const result = await fetchTeamDataFromAPI(id);
      
      if (result.success) {
        draftedTeamData.value = result.data.team;
        setTeamPlayers(DEFAULT_TEAM_STRUCTURE, result.data.players);
      } else {
        error.value = result.error;
        setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
    } finally {
      loading.value.fetchingTeam = false;
    }
  };
  
  const setTeamPlayers = (structure: TeamStructure, players?: Player[]): void => {
    draftedTeamPlayers.value = [];
    
    structure.forEach(({ position, count }) => {
      const playersForPosition = players 
        ? filterPlayersByPosition(players, position)
        : [];
      
      const slotsToCreate = Math.max(count, 0);
      const playersToAdd = playersForPosition.slice(0, slotsToCreate);
      
      // Create slots for this position
      for (let i = 0; i < slotsToCreate; i++) {
        const selectedPlayer = playersToAdd[i] || null;
        
        draftedTeamPlayers.value.push({
          draftedPlayerID: selectedPlayer?.drafted_player_id ?? undefined,
          position,
          selectedPlayer
        });
      }
    });
  };
  
  const selectPlayer = (index: number, player: Player | null): void => {
    if (index >= 0 && index < draftedTeamPlayers.value.length) {
      draftedTeamPlayers.value[index].selectedPlayer = player;
    }
  };
  
  const submitTeam = async (): Promise<void> => {
    try {
      loading.value.submittingForm = true;
      error.value = null;
      
      // Validate before submission
      if (!validationResult.value.isValid) {
        throw new Error('Form validation failed');
      }
      
      const result = await submitTeamToAPI({
        teamData: draftedTeamData.value,
        players: draftedTeamPlayers.value
      });
      
      if (result.success) {
        // Update local state with server response
        draftedTeamData.value = result.data;
        
        // Send notification emails
        await sendNotificationEmails(result.data);
      } else {
        error.value = result.error;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Submission failed';
    } finally {
      loading.value.submittingForm = false;
    }
  };
  
  const resetForm = (): void => {
    draftedTeamData.value = createEmptyTeamData();
    setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
    error.value = null;
  };
  
  return {
    // State (read-only)
    loading: readonly(loading),
    error: readonly(error),
    draftedTeamData,
    draftedTeamPlayers,
    
    // Computed
    isExistingTeam,
    selectedPlayerIds,
    budgetCalculation,
    validationResult,
    
    // Methods
    fetchTeamData,
    setTeamPlayers,
    selectPlayer,
    submitTeam,
    resetForm
  };
};
```

### Helper Functions

#### Data Utilities
```typescript
// composables/useTeamBuilder/utils.ts
import type { Player } from '~/types/Player';
import type { PlayerPosition } from '~/types/PlayerPosition';
import type { TablesInsert } from '~/types/database-generated.types';

export const createEmptyTeamData = (): TablesInsert<'drafted_teams'> => ({
  team_name: '',
  team_owner: '',
  team_email: '',
  contact_number: null,
  allow_communication: false,
  allowed_transfers: false,
});

export const filterPlayersByPosition = (
  players: Player[], 
  position: PlayerPosition
): Player[] => {
  return players.filter(player => player.position === position);
};

export const calculateTeamValue = (players: DraftedTeamPlayer[]): number => {
  return players.reduce((sum, player) => {
    return sum + (player.selectedPlayer?.cost ?? 0);
  }, 0);
};
```

#### API Functions
```typescript
// composables/useTeamBuilder/api.ts
import type { Database } from '~/types/database-generated.types';

interface FetchTeamDataResult {
  success: boolean;
  data?: {
    team: TablesInsert<'drafted_teams'>;
    players: Player[];
  };
  error?: string;
}

export const fetchTeamDataFromAPI = async (id: string): Promise<FetchTeamDataResult> => {
  const supabase = useSupabaseClient<Database>();
  
  try {
    const { data, error } = await supabase
      .from('drafted_teams')
      .select(`
        *,
        players:drafted_players(
          drafted_player_id,
          drafted_team,
          ...players_view(*)
        )
      `)
      .eq('key', id)
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      data: {
        team: data,
        players: data.players || []
      }
    };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

interface SubmitTeamResult {
  success: boolean;
  data?: TablesInsert<'drafted_teams'>;
  error?: string;
}

export const submitTeamToAPI = async (payload: {
  teamData: TablesInsert<'drafted_teams'>;
  players: DraftedTeamPlayer[];
}): Promise<SubmitTeamResult> => {
  const supabase = useSupabaseClient<Database>();
  
  try {
    // Upsert team data
    const { data: teamData, error: teamError } = await supabase
      .from('drafted_teams')
      .upsert({
        ...payload.teamData,
        active_season: '24-25', // TODO: Make configurable
        total_team_value: calculateTeamValue(payload.players)
      })
      .select()
      .single();
    
    if (teamError) {
      return { success: false, error: teamError.message };
    }
    
    // Upsert player data
    const playersData = payload.players.map(player => ({
      drafted_player: player.selectedPlayer?.player_id,
      drafted_team: teamData.drafted_team_id,
      drafted_player_id: player.draftedPlayerID
    }));
    
    const { error: playersError } = await supabase
      .from('drafted_players')
      .upsert(playersData);
    
    if (playersError) {
      return { success: false, error: playersError.message };
    }
    
    return { success: true, data: teamData };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};
```

## Component Architecture

### Pages Layer
```typescript
// pages/team-builder/index.vue
<template>
  <div class="team-builder-page">
    <Toast position="top-center" />
    
    <div class="team-builder-layout">
      <aside class="team-details-sidebar">
        <h2>Team Details</h2>
        <TeamBuilderForm
          v-model:drafted-team-data="draftedTeamData"
          v-model:drafted-team-players="draftedTeamPlayers"
          :loading="loading.submittingForm"
          :validation-result="validationResult"
          @submit="submitTeam"
        />
      </aside>
      
      <main class="team-selection-area">
        <h2>Pick a team</h2>
        
        <LoadingSpinner v-if="loading.fetchingTeam" />
        
        <div v-else class="player-grid">
          <PlayerSection
            v-for="(player, index) in draftedTeamPlayers"
            :key="`${player.position}-${index}`"
            v-model:player="player.selectedPlayer"
            :selected-players="selectedPlayerIds"
            :position="player.position"
            @update:player="selectPlayer(index, $event)"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Route and query management
const route = useRoute();
const router = useRouter();

// Team builder composable
const {
  loading,
  error,
  draftedTeamData,
  draftedTeamPlayers,
  isExistingTeam,
  selectedPlayerIds,
  budgetCalculation,
  validationResult,
  fetchTeamData,
  selectPlayer,
  submitTeam
} = useTeamBuilder();

// Handle initial load
onMounted(async () => {
  if (route.query.id && typeof route.query.id === 'string') {
    await fetchTeamData(route.query.id);
  }
});

// Handle successful submission
watch(draftedTeamData, (newData) => {
  if (newData.key && newData.key !== route.query.id) {
    router.push({
      path: '/team-builder',
      query: { id: newData.key }
    });
  }
});
</script>
```

### Form Component
```typescript
// components/TeamBuilder/TeamBuilderForm.vue
<template>
  <form class="team-builder-form" @submit.prevent="handleSubmit">
    <div class="form-fields">
      <FormField
        v-model="teamData.team_name"
        label="Team Name"
        :error="getFieldError('team_name')"
        required
      />
      
      <FormField
        v-model="teamData.team_owner"
        label="Team Owner"
        :error="getFieldError('team_owner')"
        required
      />
      
      <FormField
        v-model="teamData.team_email"
        label="Team Email"
        type="email"
        :error="getFieldError('team_email')"
        required
      />
      
      <FormField
        v-model="teamData.contact_number"
        label="Contact Number"
        :error="getFieldError('contact_number')"
      />
      
      <CheckboxField
        v-model="teamData.allowed_transfers"
        label="Allow Transfers"
      />
    </div>
    
    <BudgetDisplay
      :budget-calculation="budgetCalculation"
      :is-over-budget="budgetCalculation.isOverBudget"
    />
    
    <Button
      type="submit"
      :loading="loading"
      :disabled="!validationResult.isValid"
      class="submit-button"
    >
      Submit Team
    </Button>
  </form>
</template>

<script setup lang="ts">
import type { ValidationResult, BudgetCalculation } from '~/types/TeamBuilder';

// Props
interface Props {
  draftedTeamData: TablesInsert<'drafted_teams'>;
  draftedTeamPlayers: DraftedTeamPlayer[];
  loading: boolean;
  validationResult: ValidationResult;
  budgetCalculation: BudgetCalculation;
}

// Emits
interface Emits {
  (e: 'submit'): void;
  (e: 'update:draftedTeamData', value: TablesInsert<'drafted_teams'>): void;
  (e: 'update:draftedTeamPlayers', value: DraftedTeamPlayer[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Two-way binding
const teamData = useVModel(props, 'draftedTeamData', emit);

// Helper functions
const getFieldError = (fieldName: string): string | undefined => {
  return props.validationResult.errors.find(error => error.field === fieldName)?.message;
};

const handleSubmit = () => {
  emit('submit');
};
</script>
```

### Player Section Component
```typescript
// components/PlayerSection.vue
<template>
  <div class="player-section" :class="getPositionClass(position)">
    <div class="player-display">
      <Button
        v-if="player"
        class="clear-button"
        icon="cross"
        severity="danger"
        @click="clearPlayer"
      />
      
      <PlayerAvatar
        :player="player"
        :position="position"
        :size="'large'"
      />
      
      <PlayerDetails
        v-if="player"
        :player="player"
        :show-cost="true"
      />
    </div>
    
    <PlayerSelect
      v-model="selectedPlayer"
      :available-players="availablePlayers"
      :position="position"
      :placeholder="`Select a ${getPositionName(position)}`"
    />
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/types/Player';
import type { PlayerPosition } from '~/types/PlayerPosition';

// Props
interface Props {
  player: Player | null;
  selectedPlayers: number[];
  position: PlayerPosition;
}

// Emits
interface Emits {
  (e: 'update:player', value: Player | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Two-way binding
const selectedPlayer = useVModel(props, 'player', emit);

// Player store
const playerStore = usePlayerStore();

// Computed
const availablePlayers = computed(() => {
  return playerStore.players
    .filter(p => p.position === props.position)
    .filter(p => !p.unavailable_for_season)
    .filter(p => !props.selectedPlayers.includes(p.player_id) || p.player_id === props.player?.player_id)
    .sort((a, b) => a.team - b.team);
});

// Methods
const clearPlayer = () => {
  selectedPlayer.value = null;
};

const getPositionClass = (position: PlayerPosition): string => {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return 'player-section--goalkeeper';
    case PlayerPosition.DEFENDER:
      return 'player-section--defender';
    case PlayerPosition.MIDFIELDER:
      return 'player-section--midfielder';
    case PlayerPosition.FORWARD:
      return 'player-section--forward';
    default:
      return '';
  }
};
</script>
```

## Configuration System

### Team Builder Configuration
```typescript
// config/team-builder.ts
export interface TeamBuilderConfig {
  currentSeason: string;
  budgets: {
    base: number;
    withTransfers: number;
  };
  teamStructure: TeamStructure;
  email: {
    admin: string;
    from: string;
  };
  features: {
    allowTransfers: boolean;
    enableWhatsApp: boolean;
    enableEditMode: boolean;
  };
}

export const teamBuilderConfig: TeamBuilderConfig = {
  currentSeason: process.env.NUXT_CURRENT_SEASON || '24-25',
  budgets: {
    base: 90,
    withTransfers: 85
  },
  teamStructure: DEFAULT_TEAM_STRUCTURE,
  email: {
    admin: process.env.NUXT_ADMIN_EMAIL || 'admin@example.com',
    from: process.env.NUXT_FROM_EMAIL || 'noreply@example.com'
  },
  features: {
    allowTransfers: true,
    enableWhatsApp: true,
    enableEditMode: true
  }
};
```

## Error Handling Strategy

### Error Types
```typescript
// types/Errors.ts
export interface TeamBuilderError {
  code: string;
  message: string;
  field?: string;
  retryable: boolean;
}

export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  TEAM_INCOMPLETE = 'TEAM_INCOMPLETE',
  PLAYER_UNAVAILABLE = 'PLAYER_UNAVAILABLE'
}
```

### Error Handling Composable
```typescript
// composables/useErrorHandler.ts
export const useErrorHandler = () => {
  const handleError = (error: unknown): TeamBuilderError => {
    if (error instanceof TeamBuilderError) {
      return error;
    }
    
    if (error instanceof Error) {
      // Parse known error patterns
      if (error.message.includes('budget')) {
        return {
          code: ErrorCodes.BUDGET_EXCEEDED,
          message: 'Your team exceeds the budget limit',
          retryable: false
        };
      }
      
      if (error.message.includes('network')) {
        return {
          code: ErrorCodes.NETWORK_ERROR,
          message: 'Network error occurred. Please try again.',
          retryable: true
        };
      }
    }
    
    // Default error
    return {
      code: ErrorCodes.SERVER_ERROR,
      message: 'An unexpected error occurred',
      retryable: true
    };
  };
  
  return { handleError };
};
```

## Performance Optimizations

### Memoization Strategy
```typescript
// composables/useTeamBuilder/optimizations.ts
import { computed, shallowRef } from 'vue';

// Optimized player filtering
export const useOptimizedPlayerFiltering = (
  players: Ref<Player[]>,
  selectedIds: Ref<number[]>
) => {
  const playersMap = computed(() => {
    const map = new Map<number, Player>();
    players.value.forEach(player => {
      map.set(player.player_id, player);
    });
    return map;
  });
  
  const availablePlayersByPosition = computed(() => {
    const result = new Map<PlayerPosition, Player[]>();
    
    players.value.forEach(player => {
      if (player.unavailable_for_season) return;
      if (selectedIds.value.includes(player.player_id)) return;
      
      const positionPlayers = result.get(player.position) || [];
      positionPlayers.push(player);
      result.set(player.position, positionPlayers);
    });
    
    return result;
  });
  
  return {
    playersMap,
    availablePlayersByPosition
  };
};
```

---

*This technical specification should be updated as the architecture evolves and new requirements emerge.*