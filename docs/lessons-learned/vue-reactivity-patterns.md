# Vue Reactivity Patterns and Gotchas

## Overview

This document captures lessons learned about Vue 3 reactivity system, common pitfalls, and debugging techniques discovered during development.

## Common Issues and Solutions

### 1. Dual Composable Instance Problem

**Date**: 2025-01-08  
**Context**: Team Builder Transfer Budget calculation  
**Problem**: UI not updating despite reactive calculations working correctly

#### The Issue
When multiple components call the same composable, each creates its own independent reactive state:

```typescript
// ❌ PROBLEMATIC: Creates two separate instances
// pages/team-builder/index.vue
const { draftedTeamPlayers } = useTeamBuilder(); // Instance A

// components/TeamBuilder/TeamBuilderForm.vue  
const { remainingBudget } = useTeamBuilder(); // Instance B
```

**Result**: Player selections updated Instance A's state, but UI displayed Instance B's state.

#### The Solution
Use a single composable instance and pass data via props:

```typescript
// ✅ CORRECT: Single instance with props
// pages/team-builder/index.vue
const { draftedTeamPlayers, remainingBudget } = useTeamBuilder(); // Single instance

// components/TeamBuilder/TeamBuilderForm.vue
const props = defineProps<{ remainingBudget: number }>();
// Uses props instead of composable
```

#### Key Learnings
- Each composable call creates a new reactive closure
- No automatic state sharing between composable instances
- Props/emit pattern is cleaner than multiple composable instances

### 2. Computed vs WatchEffect for Complex Reactivity

**Problem**: Computed properties not tracking deeply nested reactive changes

#### The Issue
```typescript
// ❌ May not track nested changes properly
const teamValue = computed(() => {
  return draftedTeamPlayers.value.reduce(
    (prev, curr) => prev + (curr.selectedPlayer?.cost ?? 0), 0
  );
});
```

#### The Solution
Use `watchEffect` for explicit dependency tracking:

```typescript
// ✅ Explicitly tracks all dependencies
const teamValue = ref(0);
watchEffect(() => {
  const value = draftedTeamPlayers.value.reduce(
    (prev, curr) => prev + (curr.selectedPlayer?.cost ?? 0), 0
  );
  teamValue.value = value;
});
```

### 3. Props vs Composables Conflict

**Problem**: Vue warning about "extraneous non-props attributes"

#### The Issue
Passing props to a component that also uses the same composable:

```vue
<!-- ❌ PROBLEMATIC: Dual data sources -->
<TeamBuilderForm :remaining-budget="remainingBudget" />

<script>
// Component also calls useTeamBuilder()
const { remainingBudget } = useTeamBuilder();
</script>
```

#### The Solution
Choose one pattern - either props OR composable, not both:

```vue
<!-- ✅ CORRECT: Props only -->
<TeamBuilderForm :remaining-budget="remainingBudget" />

<script>
// Component uses props only
const props = defineProps<{ remainingBudget: number }>();
</script>
```

## Debugging Techniques

### 1. Reactivity Debugging

Add logging to track reactive updates:

```typescript
// Debug computed properties
const teamValue = computed(() => {
  console.log('teamValue computing, dependencies:', {
    playersCount: draftedTeamPlayers.value.length,
    players: draftedTeamPlayers.value.map(p => p.selectedPlayer?.cost || 0)
  });
  return /* calculation */;
});

// Debug watchers
watch(() => draftedTeamPlayers.value, (newVal) => {
  console.log('draftedTeamPlayers changed:', newVal);
}, { deep: true });
```

### 2. Instance Detection

Check if you have multiple composable instances:

```typescript
// Add to composable for debugging
let instanceCount = 0;
export const useTeamBuilder = () => {
  instanceCount++;
  console.log(`useTeamBuilder instance #${instanceCount} created`);
  // ... rest of composable
};
```

### 3. Vue DevTools

Use Vue DevTools to inspect:
- Component state vs composable state
- Reactive dependency graphs
- Update triggers and timing

## Best Practices

### 1. Single Instance Pattern

**Rule**: Use composables in parent components, pass data as props to children

```typescript
// ✅ Parent: Uses composable
const parentData = useComposable();

// ✅ Child: Uses props
const props = defineProps<{ data: ComposableData }>();
```

### 2. Explicit Reactivity

**Rule**: Use `watchEffect` for complex dependency tracking

```typescript
// ✅ For simple dependencies
const computed = computed(() => simpleCalculation(data.value));

// ✅ For complex/nested dependencies  
const result = ref(0);
watchEffect(() => {
  result.value = complexCalculation(nestedData.value);
});
```

### 3. Reactive Object Creation

**Rule**: Use `reactive()` for objects that need deep reactivity

```typescript
// ✅ For objects with changing properties
const createReactiveItem = (data) => reactive({
  id: data.id,
  value: data.value,
  nested: { property: data.nested }
});
```

## Warning Signs

Watch out for these indicators of reactivity issues:

- **Vue warnings** about extraneous props
- **UI not updating** despite console logs showing correct calculations
- **Multiple composable calls** in related components
- **Computed properties** not re-running when expected
- **Inconsistent state** between different parts of the app

## Migration Patterns

### From Component Logic to Composables

1. **Extract gradually**: Start with pure functions, then add reactivity
2. **Single instance**: Use composable in one parent component
3. **Props cascade**: Pass reactive data down as props
4. **Emit changes**: Use events to communicate changes back up

### From Multiple Instances to Single Instance

1. **Identify the parent**: Choose the highest common ancestor
2. **Move composable call**: Call composable only in the parent
3. **Add props**: Define props for all needed data
4. **Update templates**: Use props instead of composable data
5. **Add event handlers**: Handle changes with emit/events

---

*Last updated: 2025-01-08*