# System Architecture

**League of our own** - Fantasy Football Web Application

*Last updated: 2025-07-24*

## Overview

This is a sophisticated fantasy football web application built with modern web technologies. The application serves as a private league management system where users can create fantasy teams, track player statistics, and compete in weekly competitions based on real Premier League data.

**Core Statistics:**
- **Established**: 1989/1990
- **Application Type**: Single Page Application (SPA)
- **Primary Language**: TypeScript (strict mode)
- **Target Users**: Private fantasy football league members
- **Data Source**: Fantasy Premier League (FPL) API integration

## Technical Stack

### Frontend Architecture

#### Core Framework
- **Nuxt 3** (v3.17.6) - Vue.js framework configured as SPA
  - SSR disabled (`ssr: false`)
  - File-based routing with `/pages/` directory
  - Auto-imports for components and composables
  - Built-in TypeScript support

#### UI Framework & Styling
- **PrimeVue** (v4.2.5) - Component library
  - Custom Aura theme with `theme: 'none'` configuration
  - Integrated with Tailwind CSS via `tailwindcss-primeui`
  - Comprehensive component set (DataTable, Calendar, Dialog, etc.)

- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
  - Custom configuration for PrimeVue integration
  - Responsive design with breakpoints
  - Custom colour palette and typography

#### State Management
- **Pinia** (v2.3.0) - Vue 3 state management
  - Modular store architecture
  - TypeScript-first approach
  - Reactive state with computed properties

#### Validation & Forms
- **Vuelidate** (v2.0.3) - Form validation library
  - Reactive validation rules
  - Integration with PrimeVue components
  - Custom validation patterns

### Backend Integration

#### Database & Authentication
- **Supabase** (v2.47.10) - Backend-as-a-Service
  - PostgreSQL database with Row Level Security
  - Real-time subscriptions
  - Authentication with custom profiles
  - Auto-generated TypeScript types

#### Server-Side Functionality
- **Nitro** - Nuxt 3's server engine
  - API routes in `/server/api/`
  - Email functionality via Resend service
  - Admin notifications and user confirmations
- **Turnstile Module** (@nuxtjs/turnstile) - Bot protection service
  - Cloudflare Turnstile integration
  - Built-in validation endpoint
  - Automated token management

### Development & Quality Tools

#### Code Quality
- **ESLint** (v0.7.3) - Code linting with Nuxt configuration
- **TypeScript** (v5.8.3) - Type checking with strict mode
- **Prettier** - Code formatting (implicit via ESLint)

#### Package Management
- **pnpm** (v9.6.0) - Fast, disk space efficient package manager
- **Node.js** - Runtime environment

## Application Architecture

### Directory Structure

```
league-of-our-own/
├── assets/                 # Static assets (styles, images)
├── components/            # Vue components (feature-organised)
├── composables/          # Reusable business logic
├── docs/                 # Documentation
├── logic/                # Domain-specific business rules
├── pages/                # File-based routing
├── server/               # Nitro API endpoints
├── stores/               # Pinia state management
├── supabase/             # Database configuration
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Component Architecture

#### Component Organisation Pattern
```
components/
├── Common/               # Reusable UI components
│   ├── FormField.vue    # Form input wrapper
│   ├── Modal.vue        # Centralised modal system
│   └── ...
├── Drafted/             # Fantasy team management
├── Fixture/             # Match fixture components
├── Skeleton/            # Loading state components
├── Table/               # League table components
├── TeamBuilder/         # Team creation workflow
└── Feature*.vue         # Feature-specific components
```

#### Key Component Patterns
- **Centralised Modal System**: Single `Modal.vue` component with content injection
- **Skeleton Loading**: Dedicated skeleton components for each data type
- **Feature-based Organisation**: Components grouped by business feature
- **Reusable Common Components**: Shared UI elements with consistent API

### State Management Architecture

#### Store Structure
```
stores/
├── account.ts           # User authentication & session
├── draftedTeams.ts      # Fantasy team management
├── fixtures.ts          # Match fixtures & statistics
├── players.ts           # Player database & filtering
└── table.ts             # League table & weekly stats
```

#### State Management Patterns
- **Pinia Stores**: Global state for cross-component data
- **Composables**: Reusable business logic and computed properties
- **Props/Emit**: Component-to-component communication
- **Reactive Patterns**: Vue 3 reactivity system throughout

### Data Flow Architecture

#### Client-Server Communication
```
Frontend (Vue 3) → Supabase Client → PostgreSQL Database
                ↓
           Nitro API Endpoints → External Services (Email)
```

#### State Flow Patterns
```
User Action → Component → Store/Composable → Database
                       ↓
                  Reactive UI Updates
```

### Type Safety Architecture

#### TypeScript Configuration
- **Strict Mode**: All strict TypeScript options enabled
- **No `any` Types**: Comprehensive type coverage
- **Generated Types**: Auto-generated from Supabase schema
- **Custom Overrides**: Project-specific type extensions

#### Type System Structure
```
types/
├── database-generated.types.ts  # Auto-generated Supabase types
├── database.types.ts           # Custom type overrides
├── DraftedPlayer.ts           # Fantasy team types
├── Fixture.ts                 # Match fixture types
├── Player.ts                  # Player data types
└── ...                        # Feature-specific types
```

## Business Logic Architecture

### Core Domain Models

#### Team Management
- **Drafted Teams**: Fantasy teams with budget constraints
- **Team Validation**: 11 players, position requirements, budget limits
- **Transfer System**: Optional player trading with expiry dates

#### Player Management
- **FPL Integration**: Real Premier League player data
- **Statistics Tracking**: Match performance and fantasy points
- **Filtering System**: Advanced search and filter capabilities

#### Fixture Management
- **Two-Stage Verification**: Populate → Verify workflow
- **Statistics Collection**: Per-match player performance
- **Weekly Processing**: Automated statistics calculation

### Business Rules Engine

#### Team Validation Rules
```typescript
// Team Formation Requirements
- 1 Goalkeeper
- 4 Defenders  
- 3 Midfielders
- 3 Forwards

// Budget Constraints
- Standard Teams: 90 points
- Teams with Transfers: 85 points
- No duplicate players
```

#### Scoring Algorithm
```typescript
// Goal Points by Position
- Goalkeepers: 10 points
- Defenders: 7 points
- Midfielders: 5 points
- Forwards: 3 points

// Additional Scoring
- Assists: 3 points
- Clean Sheets: GK(5), DEF(2)
- Red Cards: -10 points
- Goal Bonuses: 2 goals(+5), 3+ goals(+10)
```

### Workflow Architecture

#### User Workflows
1. **Team Creation**: Player selection → Form validation → Security check (Turnstile) → Email confirmation
2. **Team Monitoring**: Weekly statistics → League table updates
3. **Transfer Management**: Optional player trading within deadlines

#### Admin Workflows
1. **Fixture Management**: Score population → Verification → Statistics calculation
2. **Weekly Processing**: Fixture completion → Table updates → Winner determination

## Integration Architecture

### External Service Integration

#### Supabase Integration
- **Database Operations**: Type-safe queries with generated types
- **Authentication**: Custom user profiles with role-based access
- **Real-time Updates**: Live data synchronisation
- **Row Level Security**: Data access control

#### Email Service Integration
- **Resend Service**: HTML email delivery
- **Template System**: Dynamic email generation
- **Notification Types**: User confirmations, admin alerts

### API Architecture

#### Nitro API Endpoints
```
/api/
├── admin-email.post.ts      # Admin notification emails
├── user-email.post.ts       # User confirmation emails
└── _turnstile/
    └── validate             # Turnstile bot validation (built-in)
```

#### Database API Patterns
- **Generated Client**: Auto-generated Supabase client
- **Type Safety**: Full TypeScript integration
- **Error Handling**: Comprehensive error management
- **Query Optimisation**: Efficient data fetching patterns

## Security Architecture

### Authentication & Authorisation
- **Supabase Auth**: Secure user authentication
- **Role-Based Access**: Admin vs. standard user permissions
- **Session Management**: Secure session handling
- **Row Level Security**: Database-level access control

### Bot Protection & Spam Prevention
- **Cloudflare Turnstile**: Enterprise-grade bot detection and prevention
  - Privacy-focused alternative to reCAPTCHA
  - Built-in validation endpoint (`/_turnstile/validate`)
  - Minimal user interaction (often invisible)
  - 99%+ protection against automated spam
- **Rate Limiting**: Team edit limits (5 modifications per team)
- **Form Validation**: Multi-layer client and server-side validation

### Data Protection
- **Type Validation**: Runtime type checking with schemas
- **Input Sanitisation**: User input validation
- **SQL Injection Prevention**: Parameterised queries
- **CSRF Protection**: Built-in framework protection

## Performance Architecture

### Frontend Optimisation
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Component and asset optimisation
- **Caching Strategy**: Browser and service worker caching
- **Bundle Optimisation**: Tree shaking and minification

### Database Performance
- **Query Optimisation**: Efficient database queries
- **Indexing Strategy**: Proper database indexing
- **Caching Layer**: Supabase built-in caching
- **Real-time Efficiency**: Optimised subscription patterns

## Development Architecture

### Development Workflow
```bash
# Development Commands
pnpm dev              # Development server with hot reload
pnpm build           # Production build
pnpm typecheck       # TypeScript validation
pnpm lint           # Code quality checks
pnpm generate-types  # Supabase type generation
```

### Quality Assurance
- **TypeScript Strict Mode**: Comprehensive type checking
- **ESLint Configuration**: Code style enforcement
- **Automated Testing**: Component and integration testing
- **Code Review Process**: Pull request requirements

### Deployment Architecture
- **Static Site Generation**: Pre-built application
- **CDN Distribution**: Global content delivery
- **Environment Configuration**: Multi-environment support
- **Monitoring**: Performance and error tracking

## Architectural Decisions

### Key Design Decisions

#### **Critical Decisions**
- **SPA Architecture**: Chosen for rich interactivity and real-time updates
- **Supabase Backend**: Selected for rapid development and built-in features
- **TypeScript Strict Mode**: Enforced for type safety and code quality
- **Pinia State Management**: Preferred over Vuex for Vue 3 compatibility

#### **Important Decisions**
- **PrimeVue UI Library**: Chosen for comprehensive component set
- **File-based Routing**: Leveraged Nuxt 3's convention over configuration
- **Composable Architecture**: Adopted for reusable business logic
- **Two-stage Verification**: Implemented for data integrity

#### **Supporting Decisions**
- **Tailwind CSS**: Selected for utility-first styling approach
- **pnpm Package Manager**: Chosen for performance and disk efficiency
- **Vuelidate Validation**: Integrated for form validation needs
- **Resend Email Service**: Selected for reliable email delivery
- **Cloudflare Turnstile**: Implemented for bot protection (privacy-focused, elderly-friendly)