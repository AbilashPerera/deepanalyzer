# RiskLens

## Overview

The RiskLens is an AI-powered decentralized application for evaluating tokenized real-world assets (RWAs). It provides comprehensive risk scoring, investment recommendations, and real-time market monitoring to help investors make informed decisions in the tokenized asset ecosystem.

The application analyzes RWA projects across five key dimensions: financial health, team credibility, market viability, regulatory compliance, and technical implementation. Using GPT-5 integration, it generates 0-100 risk scores with personalized investment guidance based on user risk tolerance profiles (conservative, moderate, aggressive).

Built for the Mantle Global Hackathon 2025, targeting the AI & Oracles, RWA/RealFi, and Infrastructure & Tooling tracks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: Radix UI primitives with shadcn/ui styling, providing accessible, customizable components. The design follows a dark-themed, glassmorphic aesthetic inspired by premium blockchain analytics platforms (DeFi Llama, Dune Analytics).

**Styling Approach**: Tailwind CSS with custom design tokens for consistent spacing, colors, and typography. Three primary font families:
- Inter for data displays and body text
- Space Grotesk for headlines and branding
- JetBrains Mono for technical details (addresses, token amounts)

**State Management**: TanStack Query (React Query) for server state management, providing caching, background refetching, and optimistic updates. No global client state library needed due to server-driven architecture.

**Routing**: Wouter for lightweight client-side routing. Main routes include landing page, dashboard, explore (project listings), submit (new project form), and project detail views.

**Data Visualization**: Recharts for interactive charts and graphs displaying risk scores, market trends, and portfolio analytics.

**Animation**: Framer Motion for smooth transitions, card animations, and interactive feedback.

**Wallet Integration**: MetaMask integration for Mantle Network connectivity (both mainnet and testnet), enabling future on-chain features and wallet-based authentication.

### Backend Architecture

**Runtime**: Node.js with Express.js framework, fully typed with TypeScript.

**API Design**: RESTful API endpoints for project management, risk analysis, alerts, and market data. Key routes:
- `GET/POST /api/projects` - List and create RWA projects
- `GET /api/projects/:id` - Retrieve single project with analysis
- `GET /api/alerts` - Fetch risk alerts
- `GET /api/market-data` - Retrieve market information

**Data Storage Strategy**: In-memory storage implementation (`MemStorage` class) for development and MVP. The architecture abstracts storage through an `IStorage` interface, allowing easy migration to PostgreSQL using Drizzle ORM without code changes. Schema definitions already exist in `shared/schema.ts` using Drizzle's type-safe schema builder.

**AI Processing**: OpenAI GPT-5 integration for intelligent RWA analysis. The system sends structured prompts containing project details and receives JSON-formatted risk assessments including:
- Overall risk score (0-100)
- Category-specific scores (financial, team, market, regulatory, technical)
- Risk level classification (low/medium/high/critical)
- Strengths, weaknesses, and recommendations arrays
- Investment recommendations for different risk tolerance profiles

**Session Management**: Session infrastructure prepared using express-session with connect-pg-simple store (ready for PostgreSQL integration).

### Data Model Design

**Core Entities**:

1. **RWA Projects**: Represents tokenized assets with metadata including name, description, asset type (real estate, bonds, invoices, commodities), valuation, tokenomics, team information, compliance details, and contract addresses.

2. **Risk Analyses**: AI-generated assessments linked to projects, containing numerical scores across five categories, risk level classification, summary text, and actionable insights.

3. **Investment Recommendations**: Profile-based guidance (conservative/moderate/aggressive) with buy/hold/sell recommendations, suggested portfolio allocations, and reasoning.

4. **Risk Alerts**: Notification system for significant changes including risk score fluctuations, yield changes, and market events. Alerts have severity levels (info/warning/critical) and read/unread states.

5. **Market Data**: Real-time pricing and market metrics for different asset types, including price changes, trading volume, and market capitalization.

6. **Users**: User accounts for future authentication and personalized features (schema defined but not yet implemented in MVP).

**Database Strategy**: Drizzle ORM with PostgreSQL schema definitions already configured. The `drizzle.config.ts` file points to a PostgreSQL database via `DATABASE_URL` environment variable. Migration files generated in `/migrations` directory. Current implementation uses in-memory storage, but production deployment will use the configured PostgreSQL instance.

### External Dependencies

**AI Service**: OpenAI API (GPT-5 model) for risk analysis and investment recommendations. Requires `OPENAI_API_KEY` environment variable.

**Blockchain Integration**: 
- MetaMask wallet connectivity for Mantle Network
- Configured for both Mantle Mainnet (Chain ID: 0x1388) and Mantle Sepolia Testnet (Chain ID: 0x138b)
- RPC endpoints: `https://rpc.mantle.xyz` (mainnet), `https://rpc.sepolia.mantle.xyz` (testnet)
- Block explorers for transaction verification

**Future Oracle Integration**: Architecture prepared for Chainlink or similar oracle services to provide real-time price feeds and market data (currently uses mock/static data in MVP).

**Database Service**: Neon Serverless PostgreSQL (via `@neondatabase/serverless` package), configured but optional for MVP deployment.

**Deployment Platform**: Configured for Netlify deployment with build scripts handling both client and server bundling. Vite builds the client, esbuild bundles the server with selective dependency inclusion for optimal cold-start performance.

**Development Tools**:
- TypeScript for type safety across full stack
- ESBuild for fast server bundling
- Vite for frontend development and building
- Drizzle Kit for database migrations
- Replit-specific plugins for development environment integration