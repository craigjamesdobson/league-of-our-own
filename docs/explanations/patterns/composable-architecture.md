# Composable Architecture Best Practices

## Overview

This document outlines best practices for structuring and using Vue composables, based on lessons learned from the Team Builder feature implementation.

## When to Use What

### Component Logic vs Composables vs Pinia Stores

#### Component Logic
**Use when:**
- Simple, component-specific logic
- No reuse needed
- Minimal business logic
- Single component scope

```vue
<script setup>
// ✅ Good for simple component logic
const isVisible = ref(false);
const toggle = () => { isVisible.value = !isVisible.value; };
</script>
```

#### Composables
**Use when:**
- Reusable business logic
- Complex calculations
- Multiple components need same logic
- Want to unit test business logic

```typescript
// ✅ Good for reusable business logic
export const useTeamBuilder = () => {
  const teamValue = ref(0);
  const calculateBudget = (players) => { /* logic */ };
  return { teamValue, calculateBudget };
};
```

#### Pinia Stores
**Use when:**
- Global application state
- Complex state management
- Need devtools support
- State persistence required

```typescript
// ✅ Good for global state
export const useTeamBuilderStore = defineStore('teamBuilder', () => {
  const teams = ref([]);
  const currentTeam = ref(null);
  return { teams, currentTeam };
});
```

## Composable Design Patterns

### 1. Single Instance Pattern

**Problem**: Multiple composable instances create separate reactive states

**Solution**: Use composable in parent, pass data as props to children

```typescript
// ✅ CORRECT: Single instance architecture
// pages/parent.vue
const { data, methods } = useComposable(); // Single instance

// components/child.vue
const props = defineProps<{ data: ComposableData }>();
const emit = defineEmits<{ update: [data: ComposableData] }>();
```

### 2. Props/Emit Communication

**Pattern**: Child components receive data as props, emit changes back

```typescript
// Parent component
const { composableData, updateData } = useComposable();

// Child component
const props = defineProps<{ data: ComposableData }>();
const emit = defineEmits<{ 'update:data': [ComposableData] }>();

// Sync changes back to parent
watch(() => localData.value, (newVal) => {
  emit('update:data', newVal);
});
```

### 3. Reactive Return Pattern

**Pattern**: Return reactive refs and computed properties

```typescript
export const useComposable = () => {
  const state = ref(initialState);
  const computed = computed(() => /* calculation */);
  
  // Methods that modify state
  const updateState = (newValue) => {
    state.value = newValue;
  };
  
  return {
    // State (can be modified by consumer)
    state,
    // Computed (read-only)
    computed: readonly(computed),
    // Methods
    updateState,
  };
};
```

## Common Pitfalls and Solutions

### 1. Multiple Instance Creation

**❌ Problem:**
```typescript
// Each call creates separate instance
const componentA = useComposable(); // Instance 1
const componentB = useComposable(); // Instance 2
```

**✅ Solution:**
```typescript
// Single instance with props
const parent = useComposable();
// Pass data to children as props
```

### 2. Mixing Props and Composables

**❌ Problem:**
```vue
<!-- Passing props AND using composable -->
<Child :data="composableData" />

<script>
// Child also calls useComposable()
const { data } = useComposable();
</script>
```

**✅ Solution:**
```vue
<!-- Use either props OR composable -->
<Child :data="composableData" />

<script>
// Child uses props only
const props = defineProps<{ data: ComposableData }>();
</script>
```

### 3. Nested Reactivity Issues

**❌ Problem:**
```typescript
// May not track nested changes
const computed = computed(() => {
  return complexObject.value.nested.property;
});
```

**✅ Solution:**
```typescript
// Use watchEffect for explicit tracking
const result = ref(null);
watchEffect(() => {
  result.value = complexObject.value.nested.property;
});
```

## Testing Strategies

### 1. Unit Testing Composables

```typescript
// composables/useTeamBuilder.test.ts
import { useTeamBuilder } from './useTeamBuilder';

describe('useTeamBuilder', () => {
  it('should calculate team value correctly', () => {
    const { teamValue, setPlayers } = useTeamBuilder();
    
    setPlayers([
      { cost: 10, name: 'Player 1' },
      { cost: 15, name: 'Player 2' }
    ]);
    
    expect(teamValue.value).toBe(25);
  });
});
```

### 2. Integration Testing with Components

```typescript
// components/TeamBuilder.test.ts
import { mount } from '@vue/test-utils';
import TeamBuilder from './TeamBuilder.vue';

describe('TeamBuilder', () => {
  it('should update budget when players change', async () => {
    const wrapper = mount(TeamBuilder);
    
    // Simulate player selection
    await wrapper.find('[data-testid="player-select"]').setValue('player1');
    
    // Check budget display
    expect(wrapper.find('[data-testid="budget"]').text()).toBe('85.0');
  });
});
```

## Performance Considerations

### 1. Computed vs WatchEffect

```typescript
// ✅ Use computed for simple dependencies
const simple = computed(() => a.value + b.value);

// ✅ Use watchEffect for complex dependencies
const complex = ref(0);
watchEffect(() => {
  complex.value = expensiveCalculation(deepNestedData.value);
});
```

### 2. Shallow vs Deep Reactivity

```typescript
// ✅ Use shallowRef for large objects that don't need deep reactivity
const largeData = shallowRef(massiveObject);

// ✅ Use reactive for objects that need deep reactivity
const formData = reactive({ name: '', email: '', nested: {} });
```

### 3. Cleanup and Memory Leaks

```typescript
export const useComposable = () => {
  const cleanup = () => {
    // Clean up event listeners, timers, etc.
  };
  
  // Cleanup on unmount
  onBeforeUnmount(cleanup);
  
  return { /* composable API */ };
};
```

## Architecture Decision Framework

### Questions to Ask

1. **Scope**: Is this logic specific to one component or reusable?
2. **Complexity**: How complex is the business logic?
3. **Testing**: Do we need to unit test this logic?
4. **State**: Is this local state or global state?
5. **Performance**: Are there performance considerations?

### Decision Matrix

| Factor | Component Logic | Composable | Pinia Store |
|--------|----------------|------------|-------------|
| Reusability | Low | High | High |
| Testing | Hard | Easy | Easy |
| Complexity | Simple | Medium-High | High |
| State Scope | Local | Local-Shared | Global |
| Performance | Best | Good | Good |
| Devtools | No | No | Yes |

## Migration Guide

### From Component Logic to Composables

1. **Extract pure functions first**
2. **Add reactivity gradually**
3. **Test each step**
4. **Update components to use composable**
5. **Remove old component logic**

### From Multiple Composables to Single Instance

1. **Identify common parent component**
2. **Move composable call to parent**
3. **Add props to child components**
4. **Update child templates**
5. **Add emit handlers for changes**
6. **Test reactivity flows**

## Code Examples

### Complete Composable Example

```typescript
// composables/useTeamBuilder.ts
export const useTeamBuilder = () => {
  // State
  const players = ref<Player[]>([]);
  const teamData = ref<TeamData>(createEmptyTeam());
  
  // Computed
  const teamValue = computed(() => 
    players.value.reduce((sum, p) => sum + p.cost, 0)
  );
  
  const remainingBudget = computed(() => 
    BUDGET_LIMIT - teamValue.value
  );
  
  // Methods
  const addPlayer = (player: Player) => {
    players.value.push(player);
  };
  
  const removePlayer = (playerId: string) => {
    players.value = players.value.filter(p => p.id !== playerId);
  };
  
  // Lifecycle
  onMounted(() => {
    // Initialize data
  });
  
  return {
    // State
    players: readonly(players),
    teamData,
    // Computed
    teamValue,
    remainingBudget,
    // Methods
    addPlayer,
    removePlayer,
  };
};
```

---

*Last updated: 2025-01-08*