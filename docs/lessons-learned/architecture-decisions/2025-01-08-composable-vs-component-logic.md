# Architecture Decision Record: Composable vs Component Logic

**Date**: 2025-01-08  
**Status**: Accepted  
**Context**: Team Builder refactoring from component logic to composable architecture

## Problem Statement

The Team Builder feature was originally implemented with business logic directly in components. During refactoring (Task 2.1), we extracted this logic into a `useTeamBuilder` composable. However, this introduced a reactivity bug where the Transfer Budget calculation stopped updating in the UI, requiring further architectural decisions.

## Context

### Original Architecture (Working)
- Business logic directly in page and form components
- Shared reactive state through component hierarchy
- Direct access to reactive data in templates
- Simple, straightforward reactivity flow

### Refactored Architecture (Buggy)
- Business logic extracted to `useTeamBuilder` composable
- Multiple components calling the same composable
- Dual composable instances creating separate reactive states
- UI displaying stale data from wrong instance

### Fixed Architecture (Current)
- Single composable instance in parent component
- Props/emit pattern for child components
- Centralized business logic with proper reactivity

## Decision

**We decided to keep the composable architecture** despite the added complexity.

## Rationale

### Benefits of Composable Architecture

1. **Testability**: Business logic can be unit tested independently
   ```typescript
   // Easy to test in isolation
   const { teamValue, addPlayer } = useTeamBuilder();
   ```

2. **Reusability**: Logic can be shared across multiple components
   ```typescript
   // Can be used in different parts of the app
   const builderLogic = useTeamBuilder();
   ```

3. **Separation of Concerns**: Clear separation between business logic and presentation
   ```typescript
   // Business logic in composable
   const { remainingBudget } = useTeamBuilder();
   // Presentation logic in component
   const displayBudget = computed(() => `£${remainingBudget.value.toFixed(2)}`);
   ```

4. **Type Safety**: Better TypeScript support for business logic
   ```typescript
   export const useTeamBuilder = (): TeamBuilderReturn => {
     // Fully typed return interface
   };
   ```

5. **Maintainability**: Changes to business logic affect all consumers automatically
   ```typescript
   // Single source of truth for business rules
   const BUDGET_LIMIT = 90; // Change once, affects everywhere
   ```

### Costs of Composable Architecture

1. **Complexity**: More complex data flow patterns
   - Parent-child communication via props/emit
   - Need to understand instance management
   - More files and abstractions

2. **Debugging Difficulty**: Harder to trace reactivity issues
   - Multiple layers of abstraction
   - Non-obvious data flow
   - Instance management gotchas

3. **Over-engineering**: May be overkill for simple use cases
   - Added complexity for features used in one place
   - More boilerplate code
   - Cognitive overhead

## Alternatives Considered

### 1. Revert to Component Logic
**Pros**: Simple, direct, no instance management issues  
**Cons**: Code duplication, harder to test, mixing concerns  
**Decision**: Rejected - we'd lose the refactoring benefits

### 2. Pinia Store
**Pros**: Global state, devtools support, no instance issues  
**Cons**: Overkill for local state, global pollution  
**Decision**: Considered for future if state becomes more complex

### 3. Provide/Inject Pattern
**Pros**: Automatic sharing, no props drilling  
**Cons**: Implicit dependencies, harder to track data flow  
**Decision**: Rejected - less explicit than props/emit

## Implementation Details

### Single Instance Pattern
```typescript
// pages/team-builder/index.vue - SINGLE INSTANCE
const { draftedTeamData, remainingBudget, submitTeam } = useTeamBuilder();

// components/TeamBuilderForm.vue - PROPS ONLY
const props = defineProps<{
  draftedTeamData: TablesInsert<'drafted_teams'>;
  remainingBudget: number;
  submitTeam: () => Promise<void>;
}>();
```

### Props/Emit Communication
```typescript
// Child emits changes back to parent
const emit = defineEmits<{
  'update:draftedTeamData': [value: TablesInsert<'drafted_teams'>];
}>();

// Parent handles updates
@update:drafted-team-data="(newData) => Object.assign(draftedTeamData, newData)"
```

## Lessons Learned

1. **Composable Instance Management**: Each composable call creates a new instance with separate state
2. **Props vs Composables**: Don't mix props and composables for the same data
3. **Reactivity Debugging**: Use console logging and Vue devtools to trace reactivity issues
4. **Architecture Trade-offs**: More sophisticated architecture requires more sophisticated debugging

## Future Considerations

1. **If State Grows Complex**: Consider migrating to Pinia store
2. **If Used Elsewhere**: Current architecture supports reuse well
3. **If Performance Issues**: May need to optimize with shallowRef/shallowReactive
4. **If Testing Needs Grow**: Current architecture supports comprehensive testing

## Success Metrics

- ✅ Business logic is testable in isolation
- ✅ Components are focused on presentation
- ✅ Reactivity issues are resolved
- ✅ Code is maintainable and extensible
- ✅ TypeScript support is comprehensive

## Conclusion

The composable architecture provides significant benefits for maintainability, testability, and separation of concerns. While it adds complexity compared to component-based logic, the trade-off is justified for business logic of this complexity. The key insight is proper instance management - using composables in parent components and passing data as props to children.

**Decision**: Keep the composable architecture with single instance pattern.

---

*Participants: Claude, User  
*Last updated: 2025-01-08*