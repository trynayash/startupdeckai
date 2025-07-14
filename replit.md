# Pitch Deck Generator - System Architecture

## Overview

This is a full-stack web application that generates AI-powered pitch decks using local Ollama models. The application consists of a React frontend with shadcn/ui components and an Express.js backend that interfaces with Ollama for AI generation. The system is designed to work entirely locally without requiring external API keys or cloud services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for development and build processes
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js for HTTP server
- **AI Integration**: Ollama for local LLM inference
- **Data Storage**: In-memory storage (MemStorage class) for pitch decks
- **Development**: tsx for TypeScript execution in development

## Key Components

### Data Layer
- **Schema Definition**: Shared TypeScript schemas using Drizzle ORM and Zod
- **Database**: PostgreSQL with Drizzle ORM (configured but currently using memory storage)
- **Storage Interface**: Abstract storage interface allowing swappable implementations

### Frontend Components
- **PitchDeckGenerator**: Main form component for creating pitch decks
- **PitchDeckDisplay**: Component for rendering generated pitch decks
- **SettingsModal**: Configuration interface for Ollama settings
- **UI Components**: Comprehensive set of shadcn/ui components

### Backend Services
- **Ollama Integration**: Direct communication with local Ollama instance
- **Pitch Deck Generation**: AI-powered content generation with structured prompts
- **API Routes**: RESTful endpoints for deck generation and status checking

## Data Flow

1. **User Input**: User enters a problem/keyword through the PitchDeckGenerator form
2. **Validation**: Frontend validates input using Zod schemas
3. **API Request**: React Query sends validated data to Express backend
4. **AI Processing**: Backend communicates with Ollama to generate pitch deck content
5. **Storage**: Generated deck is stored in memory (with option for database persistence)
6. **Response**: Structured pitch deck data is returned to frontend
7. **Display**: PitchDeckDisplay component renders the generated content
8. **Local Storage**: Frontend optionally saves decks to browser localStorage

## External Dependencies

### AI Services
- **Ollama**: Local LLM service running on localhost:11434
- **Models**: Supports various models (default: llama3.2)
- **Fallback**: Graceful handling when Ollama service is unavailable

### Database (Configured)
- **Neon Database**: PostgreSQL provider using @neondatabase/serverless
- **Drizzle ORM**: Type-safe database operations
- **Migration Support**: Database schema versioning with drizzle-kit

### UI Libraries
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development
- **Vite Dev Server**: Hot module replacement for frontend
- **Express Server**: Backend API with middleware integration
- **tsx**: Direct TypeScript execution for development

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production

### Environment Configuration
- **Database URL**: PostgreSQL connection via DATABASE_URL environment variable
- **Ollama Host**: Configurable Ollama endpoint (default: localhost:11434)
- **NODE_ENV**: Environment-specific behavior switching

### Architectural Decisions

**Problem**: Need for local AI processing without external dependencies
**Solution**: Integration with Ollama for local LLM inference
**Rationale**: Provides privacy, cost control, and offline capability while maintaining high-quality AI generation

**Problem**: Complex UI requirements with consistent design
**Solution**: shadcn/ui component library with Tailwind CSS
**Rationale**: Provides professional, accessible components with customizable theming and responsive design

**Problem**: Type safety across frontend and backend
**Solution**: Shared TypeScript schemas using Zod and Drizzle
**Rationale**: Ensures data consistency, reduces runtime errors, and improves developer experience

**Problem**: Scalable data persistence with development flexibility
**Solution**: Abstract storage interface with memory and database implementations
**Rationale**: Allows rapid development with in-memory storage while providing path to production database persistence