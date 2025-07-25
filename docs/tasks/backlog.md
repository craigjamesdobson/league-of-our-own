# Team Builder Backlog

**Last Updated**: 2025-07-25

## 📋 Prioritized Backlog

### **High Priority (Next Sprint)**
- **Enhancement: Preserve team builder state during navigation**
  - Add KeepAlive wrapper to maintain component state when navigating between pages
  - Configure to preserve team selection and form progress when users visit fixtures, table, etc.
  - Test state persistence across different navigation patterns
  - Consider selective KeepAlive (only for team builder) vs global approach
  - Implementation options:
    - Layout-level KeepAlive wrapper around NuxtPage
    - Selective KeepAlive with include pattern for team-builder pages
    - Nuxt pageTransition configuration
  - Ensure memory management - clear state on successful submission
  - **Context**: Current issue where users lose team selection and form data when navigating away from team builder

## 🚀 Infrastructure Improvements

### **Major Upgrades (Future Planning)**
- **Chore: Nuxt 4 migration**
  - Major version upgrade with breaking changes
  - Improved performance and developer experience
  - Future-proofing for ecosystem changes
  - Comprehensive testing required

- **Chore: ESM migration**
  - Resolve Vite CJS deprecation warnings
  - Full ESM configuration (`"type": "module"`)
  - Future-proofing for Vite 6+ compatibility
  - Configuration verification needed

- **Enhancement: Hash-based RLS security**
  - Database-level security validation
  - Header-based access token validation
  - RLS policy updates and schema migration
  - Prevents direct endpoint access bypass

## 📊 Backlog Management

### **How This Gets Populated**
This backlog grows organically based on:
- **Real user feedback** from actual usage
- **Technical discoveries** during development
- **Performance bottlenecks** in production
- **Security requirements** as they emerge

### **Prioritization Approach**
- **User Impact** - Direct benefit to end users
- **Technical Health** - Code quality and maintainability
- **Security & Reliability** - Application stability
- **Development Velocity** - Future development speed

*Avoid creating work for work's sake. Let real needs drive the roadmap.*

---

*This backlog represents identified opportunities based on actual technical analysis. Items are promoted to active sprints based on real need and available capacity.*