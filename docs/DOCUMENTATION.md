# RiskLens - Technical Documentation

## Architecture Overview

The RiskLens is built as a modern full-stack application with clear separation of concerns between frontend, backend, and AI services. **All data is real and stored in PostgreSQL** - there is no demo or mock data in production.

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Landing   │  │  Dashboard  │  │  Project Details   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Explore   │  │   Submit    │  │  Risk Components   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  REST API   │  │ PostgreSQL  │  │  OpenAI Service    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────────┐
        │ OpenAI   │   │  Mantle  │   │  PostgreSQL  │
        │   GPT    │   │ Network  │   │   Database   │
        └──────────┘   └──────────┘   └──────────────┘
```

## Data Architecture

This application uses **real data only**:

- **PostgreSQL Database**: All projects, risk analyses, alerts, and market data are stored persistently
- **No Demo Data**: The landing page stats reflect actual database counts
- **Real AI Analysis**: GPT-powered analysis runs on every submitted project
- **On-Chain Registry**: Smart contracts available for on-chain data verification

## Core Components

### 1. Data Models

#### RWA Project
```typescript
interface RwaProject {
  id: string;
  name: string;
  description: string;
  assetType: "real_estate" | "bonds" | "invoices" | "commodities";
  totalValue: number;
  tokenSymbol: string;
  tokenSupply: number;
  yieldPercentage: number;
  contractAddress?: string;
  websiteUrl?: string;
  whitepaperUrl?: string;
  teamInfo: string;
  tokenomics: string;
  complianceInfo: string;
  status: "pending" | "analyzing" | "analyzed";
  createdAt: Date;
}
```

#### Risk Analysis
```typescript
interface RiskAnalysis {
  id: string;
  projectId: string;
  overallScore: number;          // 0-100
  financialHealthScore: number;   // 0-100
  teamCredibilityScore: number;   // 0-100
  marketViabilityScore: number;   // 0-100
  regulatoryComplianceScore: number; // 0-100
  technicalImplementationScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiModel: string;
  analyzedAt: Date;
}
```

### 2. AI Analysis Pipeline

The AI analysis uses a structured prompt engineering approach:

1. **Data Collection**: Gather all project information
2. **Prompt Construction**: Build comprehensive analysis prompt
3. **GPT-5 Analysis**: Submit to OpenAI for evaluation
4. **Response Parsing**: Extract structured JSON response
5. **Score Validation**: Ensure scores are within valid ranges
6. **Storage**: Save analysis and recommendations

### 3. Risk Scoring Algorithm

Risk levels are determined by the overall score:

| Score Range | Risk Level | Description |
|-------------|------------|-------------|
| 75-100 | Low | Strong fundamentals, experienced team, solid compliance |
| 50-74 | Medium | Some concerns but manageable risks |
| 25-49 | High | Significant concerns, limited track record |
| 0-24 | Critical | Major red flags, recommend avoiding |

### 4. Investment Recommendations

Recommendations are generated for three risk tolerance profiles:

- **Conservative**: Max 20% allocation, prefers low-risk assets
- **Moderate**: Max 30% allocation, balanced approach
- **Aggressive**: Max 40% allocation, higher risk tolerance

## API Reference

### Projects API

#### List Projects
```
GET /api/projects?assetType=real_estate&riskLevel=low&minYield=5
```

Query Parameters:
- `assetType`: Filter by asset type
- `riskLevel`: Filter by risk level
- `minYield`: Minimum yield percentage
- `maxYield`: Maximum yield percentage
- `minScore`: Minimum risk score
- `maxScore`: Maximum risk score

#### Get Project
```
GET /api/projects/:id
```

#### Create Project
```
POST /api/projects
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Project description...",
  "assetType": "real_estate",
  "totalValue": 1000000,
  "tokenSymbol": "PROJ",
  "tokenSupply": 1000000,
  "yieldPercentage": 8.5,
  "teamInfo": "Team details...",
  "tokenomics": "Token distribution...",
  "complianceInfo": "Regulatory info..."
}
```

#### Analyze Project
```
POST /api/projects/:id/analyze
```

### Alerts API

#### List Alerts
```
GET /api/alerts?projectId=<id>
```

#### Mark Alert Read
```
PATCH /api/alerts/:id/read
```

### Market Data API

```
GET /api/market-data?assetType=real_estate
```

## Frontend Components

### Core Components

| Component | Purpose |
|-----------|---------|
| `RiskGauge` | Circular progress indicator for risk scores |
| `RiskScoreBar` | Horizontal bar for category scores |
| `ProjectCard` | Summary card for project listings |
| `AlertItem` | Alert notification display |
| `RecommendationCard` | Investment recommendation display |
| `MarketDataCard` | Market metrics display |
| `WalletConnect` | MetaMask wallet integration |
| `ProjectFilters` | Filter controls for project exploration |

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, CTA |
| Dashboard | `/dashboard` | Overview, charts, alerts |
| Explore | `/explore` | Project listing with filters |
| Submit | `/submit` | Multi-step project submission form |
| Project Detail | `/project/:id` | Full analysis view |

## Wallet Integration

### Supported Networks

- **Mantle Mainnet**: Chain ID 5000
- **Mantle Sepolia Testnet**: Chain ID 5003

### Connection Flow

1. Check for MetaMask
2. Request account access
3. Detect current network
4. Prompt network switch if needed
5. Store connection state

## Security Considerations

1. **API Key Protection**: OpenAI key server-side only
2. **Input Validation**: Zod schemas for all inputs
3. **CORS Configuration**: Restricted origins
4. **Content Security Policy**: Strict CSP headers
5. **XSS Prevention**: React's built-in escaping

## Performance Optimizations

1. **Code Splitting**: Lazy loading for routes
2. **Asset Caching**: Long cache for static assets
3. **Query Caching**: TanStack Query for API data
4. **Image Optimization**: Appropriate formats and sizes
5. **Bundle Size**: Tree shaking and minification

## Testing Strategy

1. **Unit Tests**: Component and utility testing
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: Playwright for user flows
4. **Visual Testing**: Screenshot comparisons

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] API endpoints accessible
- [ ] Wallet connection functional
- [ ] Analysis pipeline working
- [ ] Mobile responsive verified
- [ ] Performance benchmarks met
