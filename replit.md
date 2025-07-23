# Replit.md

## Overview

This is a full-stack chat application called "your hïghñëss" built with a modern tech stack featuring React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and real-time WebSocket communication. The application provides a community-style chat platform with user authentication, message reactions, announcements, and user status management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

- ✓ Migrated from Replit Agent to standard Replit environment
- ✓ Redesigned with modern Material Design-inspired color scheme
- ✓ Replaced matrix green theme with blue/teal gradient palette  
- ✓ Updated fonts from Satoshi to Roboto for better Android compatibility
- ✓ Implemented mobile-first responsive design for Android and PC
- ✓ Created floating background elements replacing matrix code animation
- ✓ Enhanced status badges with new gradient colors (royal=orange, hacker=teal, member=blue)
- ✓ Optimized header and navigation for mobile devices
- ✓ Updated login/register forms with modern glass-morphism design
- ✓ Improved touch targets and mobile interaction patterns
- ✓ Added proper focus states and accessibility improvements
- ✓ Migrated from JSON file storage to PostgreSQL database for permanent data persistence

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with WebSocket support for real-time features
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Real-time Communication**: WebSocket server for live chat and notifications

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Storage Strategy**: PostgreSQL database with automatic fallback to JSON file storage for development

## Key Components

### Authentication System
- User registration and login with email/password
- JWT token-based session management
- Password hashing with bcryptjs
- Protected routes and API endpoints
- User status tracking (online/offline)

### Chat System
- Real-time messaging with WebSocket connections
- Message reactions (likes, hearts, fires)
- User status indicators (royal, hacker, member)
- Announcement system for administrators
- Message history and pagination

### User Management
- User profiles with display names, bios, and profile pictures
- Three-tier user status system (royal, hacker, member)
- Online user tracking and display
- Admin privileges for announcement management

### UI/UX Features
- Matrix-themed dark design with green accent colors
- Responsive design for mobile and desktop
- Loading screens and animations
- Toast notifications for user feedback
- Theme switching capability (light/dark)

## Data Flow

### Authentication Flow
1. User submits login/registration form
2. Frontend validates with Zod schemas
3. Backend processes credentials and returns JWT
4. Token stored in localStorage for subsequent requests
5. Protected routes check token validity

### Chat Message Flow
1. User types message in chat input
2. Form submission triggers API call to create message
3. Backend stores message and broadcasts via WebSocket
4. All connected clients receive real-time updates
5. UI updates with new message and reactions

### Real-time Updates
1. WebSocket connection established on user authentication
2. Server maintains connection mapping for each authenticated user
3. Events (messages, reactions, user status) broadcast to relevant connections
4. Frontend handles incoming WebSocket messages and updates UI

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **drizzle-orm**: Type-safe database ORM
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration and schema management

### Replit-specific
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling

## Deployment Strategy

### Development Environment
- Vite development server for frontend with HMR
- Node.js Express server with tsx for TypeScript execution
- Environment variable configuration for database connection
- Replit-specific plugins for enhanced development experience

### Production Build
- Vite builds optimized React application to `dist/public`
- esbuild bundles Express server to `dist/index.js`
- Static file serving from built frontend
- Environment-based configuration switching

### Database Management
- Drizzle migrations in `migrations/` directory
- Schema definitions in `shared/schema.ts` for type sharing
- Database URL configuration via environment variables
- Serverless PostgreSQL connection handling

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with `client/`, `server/`, and `shared/` directories for better code organization and type sharing
2. **Type Safety**: Full TypeScript implementation with shared schemas between frontend and backend
3. **Real-time Architecture**: WebSocket integration for immediate chat updates rather than polling
4. **Storage Abstraction**: Interface-based storage implementation allowing easy migration from in-memory to database storage
5. **Component System**: Radix UI + shadcn/ui for accessible, customizable components
6. **State Management**: React Query for server state with local state for UI concerns
7. **Authentication Strategy**: JWT tokens with localStorage persistence for stateless server design