# Team Builder Backlog & Future Planning

**Last Updated**: 2025-01-10  
**Status**: To be populated based on actual requirements and priorities  

## Current Status

### ✅ Completed
- **Phase 1**: Critical TypeScript fixes and reactive data issues
- **Phase 2**: Business logic extraction to composables

### 🔍 Immediate Priority
- Fix form population bug when loading existing teams via query parameters

---

## Future Planning Framework

### Known Technical Debt
From existing analysis documents, we have identified several areas for potential improvement:

#### From `team-builder-analysis.md`:
- Performance concerns with large datasets
- Accessibility gaps (ARIA labels, keyboard navigation)
- Hard-coded values scattered throughout codebase
- Error handling could be more robust

#### From `team-builder-technical-specs.md`:
- Configuration management system needed
- Testing infrastructure to be developed
- Documentation to be completed

---

## Potential Focus Areas

### User Experience
- _To be defined based on user feedback and business requirements_

### Performance & Scalability  
- _To be evaluated based on actual usage patterns_

### Testing & Quality
- _To be planned based on development priorities_

### Configuration & Maintenance
- _To be scoped based on operational needs_

### Infrastructure Improvements
- **ESM Migration**: Resolve Vite CJS deprecation warning by migrating to full ESM (`"type": "module"` in package.json)
  - **Context**: Vitest currently shows "CJS build of Vite's Node API is deprecated" warning
  - **Impact**: Future-proofing for Vite 6+ compatibility
  - **Priority**: Low (warning only, functionality works)
  - **Effort**: Medium (need to verify all configurations work with ESM)

- **Hash-Based RLS Security**: Enhance database security by validating access tokens at the RLS policy level
  - **Context**: Current RLS policies allow public access, relying on hash-based URLs for security
  - **Technical Approach**: Pass query hash as header (`x-team-hash`), validate against `access_token` column in RLS policies
  - **Impact**: Prevents direct Supabase endpoint access bypass, provides true database-level security
  - **Priority**: Low (current approach is appropriate for friends/family use case)
  - **Effort**: Medium (requires client header changes + RLS policy updates + schema migration)

---

## Planning Process

### How This Gets Populated
1. **User feedback** - Real user pain points and requests
2. **Business priorities** - Actual business requirements and goals  
3. **Technical assessment** - Real performance bottlenecks or maintenance issues
4. **Development capacity** - Available time and resources

### Decision Framework
- **Impact vs Effort** evaluation for each potential item
- **User value** as primary driver
- **Technical feasibility** assessment
- **Resource constraints** consideration

---

## Notes

This backlog is intentionally minimal. It should grow organically based on:
- Real user needs discovered through usage
- Actual business requirements 
- Genuine technical issues that emerge
- Available development capacity

*Avoid creating work for work's sake. Let real needs drive the roadmap.*