# Team Builder Tasks

## ✅ **Current Status: Phase 1 COMPLETED**

**Session Progress**: All Phase 1 TypeScript fixes successfully completed! All team builder related TypeScript errors resolved.

### ✅ **Key Fixes Completed This Session**:

1. **Database Type Override**: Added `drafted_teams.total_team_value: number` override in `/types/database.types.ts`
2. **Import Fix**: Changed imports from `database-generated.types` to `database.types` to use overrides
3. **Business Logic**: Fixed `total_team_value` calculation (was backwards)
4. **Type Guards**: Used proper type guards instead of casting for email functions
5. **Shared Types**: Created `/types/DraftedTeamPlayer.ts` with proper nullable `selectedPlayer`
6. **Team Builder Initialization**: Added missing `total_team_value: 0` to initial data object
7. **Contact Number Handling**: Replaced manual event handling with computed property pattern
8. **Null Safety**: Fixed `initDraftedTeamData` function signature to accept `DraftedTeam[] | null`
9. **Architecture Improvement**: Moved database operations to store with proper naming
10. **Code Quality**: All linting issues resolved

### 🏗️ **Architecture Improvements**:
- Moved Supabase calls from components to store (proper separation of concerns)
- Added `upsertDraftedTeam` and `upsertDraftedPlayers` methods to store
- Renamed bulk function to `bulkUpsertDraftedTeams` for clarity
- Updated TeamBuilderForm to use store methods instead of direct Supabase calls

### 🎯 **Next Phase**: Ready for Phase 2 - Code Organization

---

## Phase 1: Critical Fixes

### Task 1.1: Fix TypeScript Errors
**Priority:** 🔴 Critical  
**Effort:** 1 day  
**Assignee:** Lead Developer
**Status:** ✅ **COMPLETED** - All TypeScript errors resolved

#### Description
Remove all `@ts-ignore` comments and fix underlying type issues in team builder files.

#### Acceptance Criteria
- [x] Remove `@ts-ignore` comment on line 129 of `pages/team-builder/index.vue`
- [x] Remove `@ts-ignore` comment on line 147 of `pages/team-builder/index.vue`
- [x] Fix type casting in `setTeamPlayers` function
- [x] Ensure all TypeScript compiler errors are resolved
- [x] No new TypeScript errors introduced

#### ✅ **Completed Work**:
- Removed both `@ts-ignore` comments successfully
- Fixed data transformation from `DraftedPlayer.data` to `Player`
- Proper null checking for `route.query.id`
- Type guards for email functions
- Added missing `total_team_value: 0` to team builder initialization
- Implemented computed property for contact number handling
- Fixed `initDraftedTeamData` function signature to accept null values
- Moved database operations to store with proper naming and architecture
- All TypeScript errors resolved
- All linting issues fixed

#### Technical Details
- Fix type casting from `DraftedPlayer | null` to `Player | null`
- Properly handle null cases in player mapping
- Update function signatures to match actual usage

#### Dependencies
- None

#### Definition of Done
- All TypeScript errors resolved
- Code compiles without warnings
- IDE provides proper IntelliSense support

---

### Task 1.2: Fix Reactive Data Declaration
**Priority:** 🔴 Critical  
**Effort:** 0.5 days  
**Assignee:** Lead Developer
**Status:** ✅ **COMPLETED**

#### Description
Correct the reactive data declaration for `draftedTeamPlayers` to ensure proper Vue reactivity.

#### Acceptance Criteria
- [x] Fix type annotation for `draftedTeamPlayers` from `DraftedTeamPlayer[]` to `Ref<DraftedTeamPlayer[]>`
- [x] Ensure reactive updates work correctly
- [x] Verify UI updates when players are selected/deselected
- [x] Test form validation reactivity

#### Technical Details
```typescript
// Current (incorrect)
const draftedTeamPlayers: DraftedTeamPlayer[] = ref([]);

// Fixed (correct)
const draftedTeamPlayers: Ref<DraftedTeamPlayer[]> = ref([]);
```

#### Dependencies
- Task 1.1 (TypeScript fixes)

#### Definition of Done
- Reactive data properly typed
- UI updates correctly on data changes
- Form validation works as expected

---

### Task 1.3: Create Shared Type Definitions
**Priority:** 🟡 Medium  
**Effort:** 0.5 days  
**Assignee:** Lead Developer
**Status:** ✅ **COMPLETED**

#### Description
Extract duplicate `DraftedTeamPlayer` interface to shared types file.

#### Acceptance Criteria
- [x] Create new file `types/DraftedTeamPlayer.ts`
- [x] Move `DraftedTeamPlayer` interface to shared file
- [x] Update imports in `pages/team-builder/index.vue`
- [x] Update imports in `components/TeamBuilder/TeamBuilderForm.vue`
- [x] Ensure interface consistency across components
- [x] Update imports in `pages/team-builder/email.ts`

#### Technical Details
```typescript
// New file: types/DraftedTeamPlayer.ts
export interface DraftedTeamPlayer {
  draftedPlayerID?: number;
  position: PlayerPosition;
  selectedPlayer: Player | null;
}
```

#### Dependencies
- Task 1.1 (TypeScript fixes)

#### Definition of Done
- Shared type file created
- No duplicate interface definitions
- All imports updated correctly

---

### Task 1.4: Fix Null Safety Issues
**Priority:** 🟡 Medium  
**Effort:** 0.5 days  
**Assignee:** Lead Developer

#### Description
Fix potential null safety issues in computed properties and player handling.

#### Acceptance Criteria
- [ ] Fix `selectedPlayerIds` computed property null handling
- [ ] Add proper null checks in player mapping
- [ ] Ensure safe property access throughout
- [ ] Add type guards where necessary

#### Technical Details
```typescript
// Fix selectedPlayerIds computed
const selectedPlayerIds = computed(() => {
  return draftedTeamPlayers.value
    .filter(player => player.selectedPlayer !== null)
    .map(player => player.selectedPlayer!.player_id);
});
```

#### Dependencies
- Task 1.1 (TypeScript fixes)
- Task 1.2 (Reactive data fixes)

#### Definition of Done
- No potential null reference errors
- Safe property access throughout
- TypeScript strict null checks pass

---

## Phase 2: Code Organization

### Task 2.1: Create useTeamBuilder Composable
**Priority:** 🟡 Medium  
**Effort:** 2 days  
**Assignee:** Lead Developer

#### Description
Extract business logic from components into a reusable composable.

#### Acceptance Criteria
- [ ] Create `composables/useTeamBuilder.ts`
- [ ] Extract data fetching logic from index.vue
- [ ] Extract team management operations
- [ ] Add error handling and loading states
- [ ] Implement proper return types

#### Technical Details
```typescript
// composables/useTeamBuilder.ts
export const useTeamBuilder = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const draftedTeamData = ref<TablesInsert<'drafted_teams'>>({...});
  const draftedTeamPlayers = ref<DraftedTeamPlayer[]>([]);
  
  const fetchTeamData = async (id: string) => { /* ... */ };
  const setTeamPlayers = (structure: TeamStructure[], players?: Player[]) => { /* ... */ };
  
  return {
    loading: readonly(loading),
    error: readonly(error),
    draftedTeamData,
    draftedTeamPlayers,
    fetchTeamData,
    setTeamPlayers
  };
};
```

#### Dependencies
- All Phase 1 tasks completed

#### Definition of Done
- Composable created and tested
- Business logic separated from presentation
- Error handling implemented
- Loading states managed

---

### Task 2.2: Refactor Complex Functions
**Priority:** 🟡 Medium  
**Effort:** 1 day  
**Assignee:** Lead Developer

#### Description
Break down `setTeamPlayers` function into smaller, focused functions.

#### Acceptance Criteria
- [ ] Create `filterPlayersByPosition` function
- [ ] Create `mapPlayersToTeamStructure` function
- [ ] Create `createEmptyPlayerSlots` function
- [ ] Update `setTeamPlayers` to use smaller functions
- [ ] Add proper error handling to each function

#### Technical Details
```typescript
const filterPlayersByPosition = (players: Player[], position: PlayerPosition): Player[] => {
  return players.filter(player => player.position === position);
};

const createEmptyPlayerSlots = (count: number): (Player | null)[] => {
  return Array.from({ length: count }, () => null);
};

const mapPlayersToTeamStructure = (players: Player[], position: PlayerPosition): DraftedTeamPlayer[] => {
  return players.map(player => ({
    draftedPlayerID: player.drafted_player_id ?? 0,
    position,
    selectedPlayer: player
  }));
};
```

#### Dependencies
- Task 2.1 (useTeamBuilder composable)

#### Definition of Done
- Functions are focused and testable
- Single responsibility principle followed
- Proper error handling implemented

---

### Task 2.3: Add Enhanced Error Handling
**Priority:** 🟡 Medium  
**Effort:** 1 day  
**Assignee:** Lead Developer

#### Description
Implement comprehensive error handling with retry mechanisms and user feedback.

#### Acceptance Criteria
- [ ] Add retry logic for failed API calls
- [ ] Implement exponential backoff for retries
- [ ] Add specific error messages for different failure types
- [ ] Create error boundary components
- [ ] Add offline detection and handling

#### Technical Details
```typescript
const fetchWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
};
```

#### Dependencies
- Task 2.1 (useTeamBuilder composable)

#### Definition of Done
- Retry mechanisms implemented
- Better error messages provided
- Graceful fallbacks in place

---

### Task 2.4: Implement Loading States
**Priority:** 🟡 Medium  
**Effort:** 1 day  
**Assignee:** Lead Developer

#### Description
Add comprehensive loading states and skeleton loaders throughout the team builder.

#### Acceptance Criteria
- [ ] Add loading indicators for data fetching
- [ ] Implement skeleton loaders for player sections
- [ ] Add progress indicators for form submission
- [ ] Implement optimistic updates where appropriate
- [ ] Add loading states to buttons and forms

#### Technical Details
```typescript
// Loading state management
const loadingStates = reactive({
  fetchingTeam: false,
  submittingForm: false,
  loadingPlayers: false
});

// Skeleton loader components
const showSkeletonLoader = computed(() => loadingStates.fetchingTeam);
```

#### Dependencies
- Task 2.1 (useTeamBuilder composable)

#### Definition of Done
- Loading states improve user experience
- Skeleton loaders implemented
- Progress indicators working

---

## Phase 3: User Experience Enhancements

### Task 3.1: Optimize Performance
**Priority:** 🟢 Low  
**Effort:** 1 day  
**Assignee:** Lead Developer

#### Description
Optimize performance for large datasets and frequent computations.

#### Acceptance Criteria
- [ ] Optimize `selectedPlayerIds` computation using `shallowRef`
- [ ] Implement virtual scrolling for player dropdowns
- [ ] Add debouncing to search filters
- [ ] Optimize re-renders with `memo` and `computed`
- [ ] Add performance monitoring

#### Technical Details
```typescript
// Optimized computed with dependency tracking
const selectedPlayerIds = computed(() => {
  return draftedTeamPlayers.value
    .filter(player => player.selectedPlayer !== null)
    .map(player => player.selectedPlayer!.player_id);
});

// Debounced search
const debouncedSearch = debounce((searchTerm: string) => {
  // Search logic
}, 300);
```

#### Dependencies
- Phase 2 completed

#### Definition of Done
- Performance improved for large datasets
- Smooth user interactions
- Monitoring in place

---

### Task 3.2: Add Accessibility Features
**Priority:** 🟡 Medium  
**Effort:** 2 days  
**Assignee:** Lead Developer

#### Description
Implement comprehensive accessibility features for the team builder.

#### Acceptance Criteria
- [ ] Add ARIA labels to all form elements
- [ ] Implement keyboard navigation for player selection
- [ ] Add screen reader support for dynamic content
- [ ] Ensure proper focus management
- [ ] Add high contrast mode support
- [ ] Test with screen readers

#### Technical Details
```vue
<!-- Accessible form elements -->
<label for="team-name" class="sr-only">Team Name</label>
<input
  id="team-name"
  v-model="draftedTeamData.team_name"
  :aria-describedby="errors.team_name ? 'team-name-error' : undefined"
  :aria-invalid="errors.team_name ? 'true' : 'false'"
/>
<div
  v-if="errors.team_name"
  id="team-name-error"
  role="alert"
  class="error-message"
>
  {{ errors.team_name }}
</div>
```

#### Dependencies
- Phase 2 completed

#### Definition of Done
- WCAG 2.1 AA compliance achieved
- Keyboard navigation working
- Screen reader compatibility verified

---

### Task 3.3: Enhance Form Validation
**Priority:** 🟡 Medium  
**Effort:** 1 day  
**Assignee:** Lead Developer

#### Description
Improve form validation with real-time feedback and better error messages.

#### Acceptance Criteria
- [ ] Add real-time validation feedback
- [ ] Implement field-level validation
- [ ] Create better error messages
- [ ] Add success indicators
- [ ] Implement conditional validation rules

#### Technical Details
```typescript
// Real-time validation
const validationRules = {
  team_name: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  team_email: {
    required: true,
    email: true
  }
};

// Field-level validation
const validateField = (field: string, value: any) => {
  const rules = validationRules[field];
  const errors = [];
  
  if (rules.required && !value) {
    errors.push(`${field} is required`);
  }
  
  return errors;
};
```

#### Dependencies
- Task 2.1 (useTeamBuilder composable)

#### Definition of Done
- Real-time validation working
- Clear error messages
- Good user experience

---

## Phase 4: Architecture & Testing

### Task 4.1: Implement Test Suite
**Priority:** 🟡 Medium  
**Effort:** 3 days  
**Assignee:** Lead Developer

#### Description
Create comprehensive test suite following TDD principles.

#### Acceptance Criteria
- [ ] Create unit tests for business logic
- [ ] Add integration tests for components
- [ ] Implement E2E tests for critical paths
- [ ] Create test data factories
- [ ] Achieve 90%+ code coverage

#### Technical Details
```typescript
// Test data factory
const createMockDraftedTeamPlayer = (
  overrides?: Partial<DraftedTeamPlayer>
): DraftedTeamPlayer => {
  return {
    draftedPlayerID: 1,
    position: PlayerPosition.FORWARD,
    selectedPlayer: createMockPlayer(),
    ...overrides
  };
};

// Unit test example
describe('useTeamBuilder', () => {
  it('should calculate remaining budget correctly', () => {
    const { calculateRemainingBudget } = useTeamBuilder();
    const players = [
      createMockDraftedTeamPlayer({ selectedPlayer: { cost: 10 } }),
      createMockDraftedTeamPlayer({ selectedPlayer: { cost: 15 } })
    ];
    
    const result = calculateRemainingBudget(players, 90);
    expect(result).toBe(65);
  });
});
```

#### Dependencies
- All previous phases completed

#### Definition of Done
- Test suite implemented
- High code coverage achieved
- Tests following TDD principles

---

### Task 4.2: Configuration Management
**Priority:** 🟢 Low  
**Effort:** 1 day  
**Assignee:** Lead Developer

#### Description
Extract hard-coded values into configuration system.

#### Acceptance Criteria
- [ ] Create configuration files for seasons, budgets, etc.
- [ ] Extract email addresses to environment variables
- [ ] Create feature flag system
- [ ] Add validation for configuration values
- [ ] Document configuration options

#### Technical Details
```typescript
// config/team-builder.ts
export const teamBuilderConfig = {
  currentSeason: process.env.CURRENT_SEASON || '24-25',
  baseBudget: 90,
  transferBudget: 85,
  teamStructure: [
    { position: PlayerPosition.GOALKEEPER, count: 1 },
    { position: PlayerPosition.DEFENDER, count: 4 },
    { position: PlayerPosition.MIDFIELDER, count: 3 },
    { position: PlayerPosition.FORWARD, count: 3 }
  ],
  email: {
    admin: process.env.ADMIN_EMAIL || 'admin@example.com',
    from: process.env.FROM_EMAIL || 'noreply@example.com'
  }
};
```

#### Dependencies
- Phase 3 completed

#### Definition of Done
- Configuration externalized
- Environment-specific values
- Documentation complete

---

### Task 4.3: Add Documentation
**Priority:** 🟢 Low  
**Effort:** 1 day  
**Assignee:** Lead Developer

#### Description
Create comprehensive documentation for the team builder system.

#### Acceptance Criteria
- [ ] Create API documentation
- [ ] Add component usage guidelines
- [ ] Write troubleshooting guides
- [ ] Document architecture decisions
- [ ] Add code examples

#### Technical Details
```markdown
# Team Builder API Documentation

## useTeamBuilder Composable

### Usage
```typescript
const {
  loading,
  error,
  draftedTeamData,
  draftedTeamPlayers,
  fetchTeamData,
  setTeamPlayers
} = useTeamBuilder();
```

### Methods
- `fetchTeamData(id: string)`: Fetches team data by ID
- `setTeamPlayers(structure, players?)`: Sets up team structure
```

#### Dependencies
- All other tasks completed

#### Definition of Done
- Complete documentation
- Code examples included
- Architecture documented

---

## Task Dependencies Graph

```
Phase 1: Critical Fixes
├── Task 1.1: Fix TypeScript Errors
├── Task 1.2: Fix Reactive Data Declaration (depends on 1.1)
├── Task 1.3: Create Shared Type Definitions (depends on 1.1)
└── Task 1.4: Fix Null Safety Issues (depends on 1.1, 1.2)

Phase 2: Code Organization
├── Task 2.1: Create useTeamBuilder Composable (depends on Phase 1)
├── Task 2.2: Refactor Complex Functions (depends on 2.1)
├── Task 2.3: Add Enhanced Error Handling (depends on 2.1)
└── Task 2.4: Implement Loading States (depends on 2.1)

Phase 3: User Experience Enhancements
├── Task 3.1: Optimize Performance (depends on Phase 2)
├── Task 3.2: Add Accessibility Features (depends on Phase 2)
└── Task 3.3: Enhance Form Validation (depends on 2.1)

Phase 4: Architecture & Testing
├── Task 4.1: Implement Test Suite (depends on Phase 3)
├── Task 4.2: Configuration Management (depends on Phase 3)
└── Task 4.3: Add Documentation (depends on all other tasks)
```

## Effort Summary

| Phase | Tasks | Total Effort | Critical Path |
|-------|-------|--------------|---------------|
| 1 | 4 | 2.5 days | 2.5 days |
| 2 | 4 | 5 days | 7.5 days |
| 3 | 3 | 4 days | 11.5 days |
| 4 | 3 | 5 days | 16.5 days |

**Total Project Effort:** 16.5 days for a skilled developer

---

*This task list should be updated as work progresses and new requirements emerge.*