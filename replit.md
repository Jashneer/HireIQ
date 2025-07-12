# replit.md

## Overview

This is a full-stack AI-powered recruiter agent called "HireIQ" (formerly "Recruiter Copilot") - a SaaS application that helps recruiters analyze job descriptions against resumes and generate personalized outreach messages. The application uses React with TypeScript for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence.

## Recent Changes

### January 2025
- **Project Name Update**: Changed from "Recruiter Copilot" to "HireIQ" for better brand positioning
- **Phased Deployment Strategy**: Temporarily disabled Stripe payment integration to enable initial deployment
- **Core MVP Focus**: Prioritized AI analysis features over payment processing for beta testing
- **Database Integration**: Configured PostgreSQL database for production-ready data persistence
- **Error Handling**: Improved error handling for optional payment features
- **Settings Page**: Added /settings route with placeholder page for future feature expansion

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, local state with React hooks
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Comprehensive component library based on Radix UI primitives

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Integration**: OpenAI GPT-4 for AI-powered analysis and message generation
- **Payment Processing**: Stripe integration for subscription management
- **Session Management**: Express sessions with PostgreSQL session store

## Key Components

### Authentication System
- JWT-based authentication with secure token management
- User registration and login with email/password
- Protected routes with middleware authentication
- Session persistence in localStorage

### AI Analysis Engine
- Skills extraction from job descriptions and resumes using OpenAI API
- Match scoring across multiple dimensions (technical, experience, domain)
- Personalized outreach message generation with customizable tone
- Improvement suggestions for better candidate matches

### Subscription Management
- Three-tier pricing model (Free, Starter, Pro)
- Usage-based limits with automatic reset cycles
- Stripe checkout integration for payment processing
- Real-time usage tracking and enforcement

### User Interface
- Responsive dashboard with comprehensive analytics
- Interactive analysis forms with file upload support
- Real-time results display with visual scoring
- Historical analysis tracking and management

## Data Flow

1. **User Authentication**: Users register/login, receive JWT tokens for session management
2. **Analysis Request**: Users submit job descriptions, resumes, and preferences through the frontend form
3. **AI Processing**: Backend calls OpenAI API to analyze skills and generate match scores
4. **Outreach Generation**: AI generates personalized outreach messages based on analysis results
5. **Data Persistence**: Analysis results are stored in PostgreSQL with user association
6. **Usage Tracking**: System monitors user activity against their subscription limits
7. **Results Display**: Frontend presents analysis results with interactive visualizations

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4 for natural language processing and content generation
- **Stripe API**: Payment processing and subscription management
- **Neon Database**: PostgreSQL hosting for production database

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production builds

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent UI elements

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server for frontend, tsx for backend hot-reload
- **Database**: Local PostgreSQL or Neon development database
- **Environment Variables**: Secure API key management through .env files

### Production Deployment
- **Build Process**: Vite builds frontend assets, esbuild bundles backend
- **Database**: Neon PostgreSQL for production data persistence
- **Static Assets**: Frontend assets served from Express static middleware
- **Process Management**: Single Node.js process handling both frontend and backend

### Configuration Management
- Environment-specific configuration through environment variables
- Secure secret management for API keys and database credentials
- Automatic database migrations through Drizzle Kit
- Health check endpoints for monitoring and deployment verification

The application is designed to be deployed on Replit with minimal configuration, supporting both development and production environments through the same codebase.