# Team Builder Testing Strategy

## Overview

This document outlines a comprehensive testing strategy for the team builder functionality, following Test-Driven Development (TDD) principles. The strategy ensures behavior-driven testing focused on business requirements rather than implementation details.

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**: Tests verify expected business behavior treating code as a black box
2. **TDD First**: All production code must be written in response to failing tests
3. **No Unit Tests**: Focus on behavior-driven testing through public APIs
4. **Real Schemas**: Use actual project schemas in tests, never redefine them
5. **Business Logic Focus**: 100% coverage of business behavior, not implementation details

### Test Organization

```
tests/
├── team-builder/
│   ├── composables/
│   │   ├── useTeamBuilder.test.ts
│   │   └── useTeamBuilder.integration.test.ts
│   ├── components/
│   │   ├── TeamBuilderForm.test.ts
│   │   └── PlayerSection.test.ts
│   ├── pages/
│   │   └── team-builder.e2e.test.ts
│   └── fixtures/
│       ├── players.ts
│       ├── teams.ts
│       └── scenarios.ts
```

## Test Data Strategy

### Factory Functions

Following the established pattern with optional overrides:

```typescript
// tests/fixtures/team-builder.ts
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Player } from '~/types/Player';
import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import type { TablesInsert } from '~/types/database-generated.types';

export const createMockPlayer = (
  overrides?: Partial<Player>
): Player => {
  return {
    player_id: 1,
    web_name: 'Test Player',
    cost: 5.0,
    position: PlayerPosition.MIDFIELDER,
    team: 1,
    team_short_name: 'TST',
    image_large: 'https://example.com/player.jpg',
    unavailable_for_season: false,
    news: '',
    ...overrides,
  };
};

export const createMockDraftedTeamPlayer = (
  overrides?: Partial<DraftedTeamPlayer>
): DraftedTeamPlayer => {
  return {
    draftedPlayerID: 1,
    position: PlayerPosition.MIDFIELDER,
    selectedPlayer: createMockPlayer(),
    ...overrides,
  };
};

export const createMockTeamData = (
  overrides?: Partial<TablesInsert<'drafted_teams'>>
): TablesInsert<'drafted_teams'> => {
  return {
    team_name: 'Test Team',
    team_owner: 'Test Owner',
    team_email: 'test@example.com',
    contact_number: '07123456789',
    allow_communication: false,
    allowed_transfers: false,
    active_season: '24-25',
    total_team_value: 85.0,
    ...overrides,
  };
};

export const createCompleteTeam = (
  overrides?: {
    teamData?: Partial<TablesInsert<'drafted_teams'>>;
    customPlayers?: Partial<Player>[];
  }
): { teamData: TablesInsert<'drafted_teams'>; players: DraftedTeamPlayer[] } => {
  const teamData = createMockTeamData(overrides?.teamData);
  
  const players: DraftedTeamPlayer[] = [
    // Goalkeeper
    createMockDraftedTeamPlayer({
      position: PlayerPosition.GOALKEEPER,
      selectedPlayer: createMockPlayer({
        position: PlayerPosition.GOALKEEPER,
        cost: 5.0,
        web_name: 'Test Goalkeeper',
        ...overrides?.customPlayers?.[0]
      })
    }),
    // Defenders
    ...Array.from({ length: 4 }, (_, i) => 
      createMockDraftedTeamPlayer({
        position: PlayerPosition.DEFENDER,
        selectedPlayer: createMockPlayer({
          position: PlayerPosition.DEFENDER,
          cost: 4.5,
          web_name: `Test Defender ${i + 1}`,
          player_id: i + 2,
          ...overrides?.customPlayers?.[i + 1]
        })
      })
    ),
    // Midfielders
    ...Array.from({ length: 3 }, (_, i) => 
      createMockDraftedTeamPlayer({
        position: PlayerPosition.MIDFIELDER,
        selectedPlayer: createMockPlayer({
          position: PlayerPosition.MIDFIELDER,
          cost: 6.0,
          web_name: `Test Midfielder ${i + 1}`,
          player_id: i + 6,
          ...overrides?.customPlayers?.[i + 5]
        })
      })
    ),
    // Forwards
    ...Array.from({ length: 3 }, (_, i) => 
      createMockDraftedTeamPlayer({
        position: PlayerPosition.FORWARD,
        selectedPlayer: createMockPlayer({
          position: PlayerPosition.FORWARD,
          cost: 8.0,
          web_name: `Test Forward ${i + 1}`,
          player_id: i + 9,
          ...overrides?.customPlayers?.[i + 8]
        })
      })
    )
  ];
  
  return { teamData, players };
};

export const createBudgetScenarios = () => {
  return {
    underBudget: createCompleteTeam({
      customPlayers: Array.from({ length: 11 }, () => ({ cost: 4.0 }))
    }),
    exactBudget: createCompleteTeam({
      customPlayers: [
        { cost: 5.0 }, // GK
        { cost: 4.0 }, { cost: 4.0 }, { cost: 4.0 }, { cost: 4.0 }, // DEF
        { cost: 6.0 }, { cost: 6.0 }, { cost: 6.0 }, // MID
        { cost: 8.5 }, { cost: 8.5 }, { cost: 9.0 } // FWD
      ]
    }),
    overBudget: createCompleteTeam({
      customPlayers: Array.from({ length: 11 }, () => ({ cost: 10.0 }))
    })
  };
};
```

## Behavior-Driven Test Specifications

### useTeamBuilder Composable Tests

```typescript
// tests/team-builder/composables/useTeamBuilder.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTeamBuilder } from '~/composables/useTeamBuilder';
import { createMockPlayer, createMockTeamData, createCompleteTeam } from '~/tests/fixtures/team-builder';

describe('Team Builder Behavior', () => {
  let teamBuilder: ReturnType<typeof useTeamBuilder>;

  beforeEach(() => {
    teamBuilder = useTeamBuilder();
  });

  describe('Team Creation', () => {
    it('should initialize with empty team structure', () => {
      expect(teamBuilder.draftedTeamPlayers.value).toHaveLength(11);
      expect(teamBuilder.draftedTeamPlayers.value.filter(p => p.position === PlayerPosition.GOALKEEPER)).toHaveLength(1);
      expect(teamBuilder.draftedTeamPlayers.value.filter(p => p.position === PlayerPosition.DEFENDER)).toHaveLength(4);
      expect(teamBuilder.draftedTeamPlayers.value.filter(p => p.position === PlayerPosition.MIDFIELDER)).toHaveLength(3);
      expect(teamBuilder.draftedTeamPlayers.value.filter(p => p.position === PlayerPosition.FORWARD)).toHaveLength(3);
    });

    it('should start with all player slots empty', () => {
      const allPlayersEmpty = teamBuilder.draftedTeamPlayers.value.every(
        player => player.selectedPlayer === null
      );
      expect(allPlayersEmpty).toBe(true);
    });

    it('should not be an existing team initially', () => {
      expect(teamBuilder.isExistingTeam.value).toBe(false);
    });
  });

  describe('Player Selection', () => {
    it('should allow selecting a player for a position', () => {
      const testPlayer = createMockPlayer({
        position: PlayerPosition.GOALKEEPER,
        web_name: 'Test Keeper'
      });

      teamBuilder.selectPlayer(0, testPlayer);

      expect(teamBuilder.draftedTeamPlayers.value[0].selectedPlayer).toEqual(testPlayer);
    });

    it('should update selected player IDs when players are selected', () => {
      const testPlayer = createMockPlayer({ player_id: 123 });
      
      teamBuilder.selectPlayer(0, testPlayer);
      
      expect(teamBuilder.selectedPlayerIds.value).toContain(123);
    });

    it('should remove player from selected IDs when deselected', () => {
      const testPlayer = createMockPlayer({ player_id: 123 });
      
      teamBuilder.selectPlayer(0, testPlayer);
      teamBuilder.selectPlayer(0, null);
      
      expect(teamBuilder.selectedPlayerIds.value).not.toContain(123);
    });
  });

  describe('Budget Calculation', () => {
    it('should calculate budget correctly for standard team', () => {
      const { players } = createCompleteTeam();
      
      teamBuilder.draftedTeamPlayers.value = players;
      
      const expectedCost = players.reduce((sum, p) => sum + (p.selectedPlayer?.cost || 0), 0);
      expect(teamBuilder.budgetCalculation.value.usedBudget).toBe(expectedCost);
      expect(teamBuilder.budgetCalculation.value.remainingBudget).toBe(90 - expectedCost);
    });

    it('should use reduced budget when transfers are allowed', () => {
      teamBuilder.draftedTeamData.value.allowed_transfers = true;
      
      expect(teamBuilder.budgetCalculation.value.totalBudget).toBe(85);
    });

    it('should detect when team is over budget', () => {
      const { players } = createCompleteTeam({
        customPlayers: Array.from({ length: 11 }, () => ({ cost: 10.0 }))
      });
      
      teamBuilder.draftedTeamPlayers.value = players;
      
      expect(teamBuilder.budgetCalculation.value.isOverBudget).toBe(true);
    });
  });

  describe('Team Validation', () => {
    it('should be invalid when team name is missing', () => {
      const { players } = createCompleteTeam();
      teamBuilder.draftedTeamPlayers.value = players;
      // team_name is empty by default
      
      expect(teamBuilder.validationResult.value.isValid).toBe(false);
      expect(teamBuilder.validationResult.value.errors).toContainEqual(
        expect.objectContaining({
          field: 'team_name',
          type: 'required'
        })
      );
    });

    it('should be invalid when team is incomplete', () => {
      teamBuilder.draftedTeamData.value = createMockTeamData();
      // Players remain empty
      
      expect(teamBuilder.validationResult.value.isValid).toBe(false);
      expect(teamBuilder.validationResult.value.errors).toContainEqual(
        expect.objectContaining({
          field: 'team',
          type: 'team_incomplete'
        })
      );
    });

    it('should be invalid when team is over budget', () => {
      const { teamData, players } = createCompleteTeam({
        customPlayers: Array.from({ length: 11 }, () => ({ cost: 10.0 }))
      });
      
      teamBuilder.draftedTeamData.value = teamData;
      teamBuilder.draftedTeamPlayers.value = players;
      
      expect(teamBuilder.validationResult.value.isValid).toBe(false);
      expect(teamBuilder.validationResult.value.errors).toContainEqual(
        expect.objectContaining({
          field: 'budget',
          type: 'budget'
        })
      );
    });

    it('should be valid when all requirements are met', () => {
      const { teamData, players } = createCompleteTeam({
        customPlayers: Array.from({ length: 11 }, () => ({ cost: 4.0 }))
      });
      
      teamBuilder.draftedTeamData.value = teamData;
      teamBuilder.draftedTeamPlayers.value = players;
      
      expect(teamBuilder.validationResult.value.isValid).toBe(true);
      expect(teamBuilder.validationResult.value.errors).toHaveLength(0);
    });
  });

  describe('Team Data Loading', () => {
    it('should load existing team data successfully', async () => {
      const mockTeamData = createMockTeamData({ key: 'test-key' });
      const mockPlayers = [createMockPlayer()];
      
      // Mock the API call
      vi.mocked(fetchTeamDataFromAPI).mockResolvedValue({
        success: true,
        data: {
          team: mockTeamData,
          players: mockPlayers
        }
      });
      
      await teamBuilder.fetchTeamData('test-key');
      
      expect(teamBuilder.draftedTeamData.value).toEqual(mockTeamData);
      expect(teamBuilder.isExistingTeam.value).toBe(true);
    });

    it('should handle team data loading errors gracefully', async () => {
      vi.mocked(fetchTeamDataFromAPI).mockResolvedValue({
        success: false,
        error: 'Team not found'
      });
      
      await teamBuilder.fetchTeamData('invalid-key');
      
      expect(teamBuilder.error.value).toBe('Team not found');
      expect(teamBuilder.isExistingTeam.value).toBe(false);
    });
  });

  describe('Team Submission', () => {
    it('should submit valid team successfully', async () => {
      const { teamData, players } = createCompleteTeam({
        customPlayers: Array.from({ length: 11 }, () => ({ cost: 4.0 }))
      });
      
      teamBuilder.draftedTeamData.value = teamData;
      teamBuilder.draftedTeamPlayers.value = players;
      
      const mockSubmissionResult = { ...teamData, key: 'new-key' };
      vi.mocked(submitTeamToAPI).mockResolvedValue({
        success: true,
        data: mockSubmissionResult
      });
      
      await teamBuilder.submitTeam();
      
      expect(teamBuilder.error.value).toBe(null);
      expect(teamBuilder.draftedTeamData.value.key).toBe('new-key');
    });

    it('should prevent submission of invalid team', async () => {
      // Team with missing required fields
      teamBuilder.draftedTeamData.value = createMockTeamData({ team_name: '' });
      
      await teamBuilder.submitTeam();
      
      expect(teamBuilder.error.value).toBe('Form validation failed');
    });

    it('should handle submission errors gracefully', async () => {
      const { teamData, players } = createCompleteTeam({
        customPlayers: Array.from({ length: 11 }, () => ({ cost: 4.0 }))
      });
      
      teamBuilder.draftedTeamData.value = teamData;
      teamBuilder.draftedTeamPlayers.value = players;
      
      vi.mocked(submitTeamToAPI).mockResolvedValue({
        success: false,
        error: 'Database error'
      });
      
      await teamBuilder.submitTeam();
      
      expect(teamBuilder.error.value).toBe('Database error');
    });
  });
});
```

### Component Integration Tests

```typescript
// tests/team-builder/components/TeamBuilderForm.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TeamBuilderForm from '~/components/TeamBuilder/TeamBuilderForm.vue';
import { createMockTeamData, createCompleteTeam } from '~/tests/fixtures/team-builder';

describe('TeamBuilderForm Integration', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    const { teamData, players } = createCompleteTeam({
      customPlayers: Array.from({ length: 11 }, () => ({ cost: 4.0 }))
    });

    wrapper = mount(TeamBuilderForm, {
      props: {
        draftedTeamData: teamData,
        draftedTeamPlayers: players,
        loading: false,
        validationResult: { isValid: true, errors: [] },
        budgetCalculation: {
          totalBudget: 90,
          usedBudget: 44,
          remainingBudget: 46,
          isOverBudget: false
        }
      }
    });
  });

  describe('Form Interaction', () => {
    it('should display team data in form fields', () => {
      const teamNameInput = wrapper.find('input[name="team_name"]');
      expect(teamNameInput.element.value).toBe('Test Team');
    });

    it('should show budget information correctly', () => {
      const budgetDisplay = wrapper.find('[data-test="budget-display"]');
      expect(budgetDisplay.text()).toContain('46');
    });

    it('should disable submit button when form is invalid', async () => {
      await wrapper.setProps({
        validationResult: { 
          isValid: false, 
          errors: [{ field: 'team_name', message: 'Required', type: 'required' }] 
        }
      });

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.element.disabled).toBe(true);
    });

    it('should show loading state during submission', async () => {
      await wrapper.setProps({ loading: true });

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.classes()).toContain('loading');
    });

    it('should emit submit event when form is submitted', async () => {
      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  describe('Budget Display', () => {
    it('should show success state when budget is within limits', () => {
      const budgetMessage = wrapper.find('[data-test="budget-message"]');
      expect(budgetMessage.classes()).toContain('success');
    });

    it('should show error state when budget is exceeded', async () => {
      await wrapper.setProps({
        budgetCalculation: {
          totalBudget: 90,
          usedBudget: 100,
          remainingBudget: -10,
          isOverBudget: true
        }
      });

      const budgetMessage = wrapper.find('[data-test="budget-message"]');
      expect(budgetMessage.classes()).toContain('error');
    });

    it('should adjust budget based on transfer settings', async () => {
      await wrapper.setProps({
        budgetCalculation: {
          totalBudget: 85,
          usedBudget: 44,
          remainingBudget: 41,
          isOverBudget: false
        }
      });

      const budgetDisplay = wrapper.find('[data-test="budget-display"]');
      expect(budgetDisplay.text()).toContain('41');
    });
  });
});
```

### End-to-End Test Scenarios

```typescript
// tests/team-builder/pages/team-builder.e2e.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createPage } from '~/tests/helpers/e2e';

describe('Team Builder E2E', () => {
  let page: ReturnType<typeof createPage>;

  beforeEach(async () => {
    page = await createPage('/team-builder');
  });

  describe('Complete Team Creation Workflow', () => {
    it('should allow user to create a complete team', async () => {
      // Fill in team details
      await page.fill('input[name="team_name"]', 'My Test Team');
      await page.fill('input[name="team_owner"]', 'Test Owner');
      await page.fill('input[name="team_email"]', 'test@example.com');

      // Select players for each position
      await page.selectPlayer('goalkeeper', 'Test Goalkeeper');
      await page.selectPlayer('defender', 'Test Defender 1', 0);
      await page.selectPlayer('defender', 'Test Defender 2', 1);
      await page.selectPlayer('defender', 'Test Defender 3', 2);
      await page.selectPlayer('defender', 'Test Defender 4', 3);
      await page.selectPlayer('midfielder', 'Test Midfielder 1', 0);
      await page.selectPlayer('midfielder', 'Test Midfielder 2', 1);
      await page.selectPlayer('midfielder', 'Test Midfielder 3', 2);
      await page.selectPlayer('forward', 'Test Forward 1', 0);
      await page.selectPlayer('forward', 'Test Forward 2', 1);
      await page.selectPlayer('forward', 'Test Forward 3', 2);

      // Verify budget is within limits
      const budgetDisplay = await page.getByTestId('budget-display');
      expect(await budgetDisplay.textContent()).toContain('remaining');

      // Submit the team
      await page.click('button[type="submit"]');

      // Verify success message
      await page.waitForSelector('[data-test="success-message"]');
      expect(await page.getByTestId('success-message').textContent()).toContain('submitted');

      // Verify URL updated with team key
      expect(page.url()).toMatch(/\?id=.+/);
    });

    it('should prevent submission when team is incomplete', async () => {
      // Fill in team details but leave players empty
      await page.fill('input[name="team_name"]', 'Incomplete Team');
      await page.fill('input[name="team_owner"]', 'Test Owner');
      await page.fill('input[name="team_email"]', 'test@example.com');

      // Try to submit
      await page.click('button[type="submit"]');

      // Verify error message
      await page.waitForSelector('[data-test="error-message"]');
      expect(await page.getByTestId('error-message').textContent()).toContain('select all players');
    });

    it('should prevent submission when budget is exceeded', async () => {
      // Fill in team details
      await page.fill('input[name="team_name"]', 'Expensive Team');
      await page.fill('input[name="team_owner"]', 'Test Owner');
      await page.fill('input[name="team_email"]', 'test@example.com');

      // Select expensive players
      await page.selectExpensiveTeam();

      // Verify budget error
      const budgetDisplay = await page.getByTestId('budget-display');
      expect(await budgetDisplay.textContent()).toContain('over budget');

      // Verify submit button is disabled
      const submitButton = await page.getByRole('button', { name: 'Submit Team' });
      expect(await submitButton.isDisabled()).toBe(true);
    });
  });

  describe('Team Editing Workflow', () => {
    it('should allow editing existing team', async () => {
      // Navigate to existing team
      await page.goto('/team-builder?id=existing-team-key');

      // Wait for data to load
      await page.waitForLoadState('networkidle');

      // Verify existing data is populated
      const teamNameInput = await page.locator('input[name="team_name"]');
      expect(await teamNameInput.inputValue()).toBe('Existing Team');

      // Make changes
      await page.fill('input[name="team_name"]', 'Updated Team Name');
      await page.selectPlayer('forward', 'New Forward', 0);

      // Submit changes
      await page.click('button[type="submit"]');

      // Verify success message
      await page.waitForSelector('[data-test="success-message"]');
      expect(await page.getByTestId('success-message').textContent()).toContain('updated');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      await page.route('**/api/teams/**', route => route.abort());

      // Try to load team
      await page.goto('/team-builder?id=some-team-key');

      // Verify error message
      await page.waitForSelector('[data-test="error-message"]');
      expect(await page.getByTestId('error-message').textContent()).toContain('error');
    });

    it('should show loading states during operations', async () => {
      // Mock slow response
      await page.route('**/api/teams/**', route => 
        route.fulfill({ body: '{}', status: 200 }, { delay: 1000 })
      );

      await page.goto('/team-builder?id=some-team-key');

      // Verify loading state
      await page.waitForSelector('[data-test="loading-spinner"]');
      expect(await page.getByTestId('loading-spinner').isVisible()).toBe(true);
    });
  });
});
```

## Test Execution Strategy

### Test Categories

1. **Business Logic Tests** (composables): Fast, isolated tests for core functionality
2. **Integration Tests** (components): Test component behavior with real dependencies
3. **End-to-End Tests** (pages): Full user workflows in browser environment

### Test Running

```bash
# Run all tests
pnpm test

# Run specific test categories
pnpm test:unit          # Business logic tests
pnpm test:integration   # Component integration tests
pnpm test:e2e          # End-to-end tests

# Run with coverage
pnpm test:coverage

# Run in watch mode during development
pnpm test:watch
```

### Coverage Requirements

- **Business Logic**: 100% coverage of public API behavior
- **Integration**: 90% coverage of component interactions
- **End-to-End**: Cover all critical user workflows

### Test Data Management

```typescript
// tests/fixtures/scenarios.ts
export const teamBuilderScenarios = {
  newTeam: {
    description: 'User creating a new team',
    setup: () => createCompleteTeam(),
    expectedBehavior: 'Should allow team creation and submission'
  },
  
  editingTeam: {
    description: 'User editing an existing team',
    setup: () => createCompleteTeam({ teamData: { key: 'existing-key' } }),
    expectedBehavior: 'Should load existing data and allow updates'
  },
  
  budgetExceeded: {
    description: 'User selects players that exceed budget',
    setup: () => createCompleteTeam({ 
      customPlayers: Array.from({ length: 11 }, () => ({ cost: 10.0 }))
    }),
    expectedBehavior: 'Should prevent submission and show error'
  },
  
  incompleteTeam: {
    description: 'User attempts to submit incomplete team',
    setup: () => ({ 
      teamData: createMockTeamData(), 
      players: Array.from({ length: 11 }, () => createMockDraftedTeamPlayer({ selectedPlayer: null }))
    }),
    expectedBehavior: 'Should prevent submission and show validation errors'
  }
};
```

## TDD Workflow for Team Builder

### Red-Green-Refactor Cycle

1. **Red**: Write a failing test describing desired behavior
2. **Green**: Write minimal code to make test pass
3. **Refactor**: Improve code structure while keeping tests green

### Example TDD Session

```typescript
// Step 1: RED - Write failing test
describe('Budget calculation with transfers', () => {
  it('should reduce budget by 5 points when transfers are enabled', () => {
    const teamBuilder = useTeamBuilder();
    teamBuilder.draftedTeamData.value.allowed_transfers = true;
    
    expect(teamBuilder.budgetCalculation.value.totalBudget).toBe(85);
  });
});

// Step 2: GREEN - Implement minimal solution
const budgetCalculation = computed(() => {
  const totalBudget = draftedTeamData.value.allowed_transfers ? 85 : 90;
  // ... rest of calculation
});

// Step 3: REFACTOR - Extract constants and improve structure
const BUDGET_CONFIG = {
  BASE: 90,
  WITH_TRANSFERS: 85
};

const budgetCalculation = computed(() => {
  const totalBudget = draftedTeamData.value.allowed_transfers 
    ? BUDGET_CONFIG.WITH_TRANSFERS 
    : BUDGET_CONFIG.BASE;
  // ... rest of calculation
});
```

## Performance Testing

### Load Testing Scenarios

```typescript
// tests/performance/team-builder.perf.test.ts
describe('Team Builder Performance', () => {
  it('should handle large player datasets efficiently', async () => {
    const largePlayerSet = Array.from({ length: 1000 }, (_, i) => 
      createMockPlayer({ player_id: i })
    );
    
    const startTime = performance.now();
    
    // Test player filtering performance
    const filteredPlayers = filterPlayersByPosition(largePlayerSet, PlayerPosition.MIDFIELDER);
    
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    expect(filteredPlayers.length).toBeGreaterThan(0);
  });

  it('should efficiently calculate selected player IDs', () => {
    const teamBuilder = useTeamBuilder();
    const { players } = createCompleteTeam();
    
    teamBuilder.draftedTeamPlayers.value = players;
    
    const startTime = performance.now();
    const selectedIds = teamBuilder.selectedPlayerIds.value;
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(10); // Should be nearly instant
    expect(selectedIds).toHaveLength(11);
  });
});
```

## Accessibility Testing

```typescript
// tests/accessibility/team-builder.a11y.test.ts
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/vue';
import TeamBuilderForm from '~/components/TeamBuilder/TeamBuilderForm.vue';

describe('Team Builder Accessibility', () => {
  it('should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(TeamBuilderForm, {
      props: {
        draftedTeamData: createMockTeamData(),
        draftedTeamPlayers: [],
        loading: false,
        validationResult: { isValid: true, errors: [] },
        budgetCalculation: {
          totalBudget: 90,
          usedBudget: 0,
          remainingBudget: 90,
          isOverBudget: false
        }
      }
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should provide proper form labels and descriptions', () => {
    const { getByLabelText } = render(TeamBuilderForm, {
      props: {
        draftedTeamData: createMockTeamData(),
        draftedTeamPlayers: [],
        loading: false,
        validationResult: { isValid: true, errors: [] },
        budgetCalculation: {
          totalBudget: 90,
          usedBudget: 0,
          remainingBudget: 90,
          isOverBudget: false
        }
      }
    });

    expect(getByLabelText('Team Name')).toBeInTheDocument();
    expect(getByLabelText('Team Owner')).toBeInTheDocument();
    expect(getByLabelText('Team Email')).toBeInTheDocument();
  });
});
```

## Continuous Integration

### Test Pipeline

```yaml
# .github/workflows/test-team-builder.yml
name: Team Builder Tests

on:
  push:
    paths:
      - 'pages/team-builder/**'
      - 'components/TeamBuilder/**'
      - 'composables/useTeamBuilder.ts'
      - 'tests/team-builder/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:unit --reporter=verbose
      
      - name: Run integration tests
        run: pnpm test:integration --reporter=verbose
      
      - name: Run E2E tests
        run: pnpm test:e2e
        
      - name: Generate coverage report
        run: pnpm test:coverage --reporter=lcov
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

---

*This testing strategy should evolve as the team builder functionality grows and new requirements emerge. Regular reviews and updates are essential to maintain test quality and coverage.*