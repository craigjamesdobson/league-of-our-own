# Team Builder Backlog

**Last Updated**: 2026-09-27

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

- **Feature: Project email inbox and shared reply address**
  - Add a reliable inbox behind the project email identity used by Resend
  - Ensure Craig and Jim receive independent copies in their normal inboxes, with separate read/unread state
  - Allow both people to reply using the shared project email address
  - Decide whether to retain `leagueofourown.fpl@gmail.com` with forwarding or move to a domain-backed mailbox
  - Configure Resend email `reply-to` headers so replies to application emails reach the monitored inbox
  - Verify SPF, DKIM, and DMARC configuration for the sending domain
  - Test inbound delivery, independent unread state, replies from both users, and Resend-generated emails
  - **Context**: The current shared Gmail account means one person reading an email marks it read for everyone

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

## ✨ Nice-to-have Features

- **Feature: Star a team locally**
  - Let a visitor select one team as their team without requiring an account
  - Persist the selection in browser storage only
  - Highlight the starred team across standings, fixtures, and other relevant views
  - Show convenient additional details that are already publicly available elsewhere in the app
  - Allow the visitor to change or clear the starred team at any time
  - Treat this strictly as a personal display preference, not authentication or access control

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
