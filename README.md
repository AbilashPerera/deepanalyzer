# AI-Powered RWA Risk Analyzer

A comprehensive decentralized application (DApp) for evaluating tokenized real-world assets (RWAs) with advanced AI risk scoring, oracle data integration, and personalized investment recommendations. Built for the **Mantle Global Hackathon 2025**.

## Overview

The RWA Risk Analyzer helps investors make informed decisions in the tokenized asset ecosystem by providing:

- **AI-Powered Risk Analysis**: Using GPT-5 to analyze project fundamentals, team credibility, tokenomics, and compliance
- **Comprehensive Scoring**: 0-100 risk scores with detailed breakdowns across 5 key categories
- **Investment Recommendations**: Personalized guidance based on risk tolerance profiles
- **Real-Time Alerts**: Notifications for significant risk changes and yield fluctuations
- **Market Data Integration**: Live price feeds and market metrics via oracle data

## Features

### Core Functionality
- Submit RWA projects for AI analysis
- View comprehensive risk assessments
- Explore and filter analyzed projects
- Receive investment recommendations
- Monitor alerts and market data

### Technical Highlights
- React + TypeScript frontend with Vite
- Express.js backend with TypeScript
- OpenAI GPT-5 integration for AI analysis
- MetaMask wallet integration for Mantle Network
- Responsive, dark-themed UI with glassmorphism effects
- Recharts for interactive data visualizations

## Hackathon Tracks

This project targets multiple tracks:
- **AI & Oracles** (Primary): AI-powered analysis with oracle data integration
- **RWA / RealFi**: Real-world asset tokenization analysis
- **Infrastructure & Tooling**: Developer tools for RWA ecosystem

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rwa-risk-analyzer.git
cd rwa-risk-analyzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist/public`
4. Add environment variables in Netlify dashboard:
   - `OPENAI_API_KEY`

### Manual Build

```bash
npm run build
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                 # Backend Express server
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data storage layer
│   └── openai.ts          # AI integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle schemas
├── contracts/              # Solidity smart contracts
├── docs/                   # Documentation
└── netlify.toml           # Netlify configuration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects with filters |
| GET | `/api/projects/:id` | Get project details |
| POST | `/api/projects` | Submit new project |
| POST | `/api/projects/:id/analyze` | Trigger AI analysis |
| GET | `/api/alerts` | Get risk alerts |
| GET | `/api/recommendations` | Get investment recommendations |
| GET | `/api/market-data` | Get market data |

## Risk Scoring Categories

1. **Financial Health** (0-100): Asset valuation, yield sustainability, liquidity
2. **Team Credibility** (0-100): Experience, track record, transparency
3. **Market Viability** (0-100): Market size, competition, growth potential
4. **Regulatory Compliance** (0-100): Licenses, KYC/AML, jurisdiction risks
5. **Technical Implementation** (0-100): Smart contract security, infrastructure

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Node.js, Express.js, TypeScript
- **AI**: OpenAI GPT-5
- **Blockchain**: Mantle Network, Ethers.js
- **Charts**: Recharts
- **Deployment**: Netlify

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

MIT License - see LICENSE file for details.

## Team

Built with passion for the Mantle Global Hackathon 2025.

## Links

- [Mantle Network](https://www.mantle.xyz)
- [Live Demo](https://rwa-analyzer.netlify.app)
- [Documentation](./docs/DOCUMENTATION.md)
- [Roadmap](./docs/ROADMAP.md)
