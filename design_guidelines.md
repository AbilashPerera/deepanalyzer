# Design Guidelines: AI-Powered RWA Risk Analyzer

## Design Approach

**Reference-Based Strategy**: Drawing inspiration from premium blockchain analytics platforms (DeFi Llama, Dune Analytics, Arkham Intelligence) combined with enterprise data visualization principles. This approach balances professional credibility with modern Web3 aesthetics to convey trust and technical sophistication.

**Core Design Principles**:
- Data clarity over decoration - every visual element serves the data
- Professional dark theme with high-contrast text for extended reading
- Glassmorphic cards for depth without compromising readability
- Gradient accents for visual hierarchy and brand differentiation
- Trustworthy, institutional-grade presentation

## Typography

**Font System** (Google Fonts):
- **Primary**: Inter (400, 500, 600, 700) - exceptional readability for data displays
- **Display/Headlines**: Space Grotesk (600, 700) - modern, technical feel for hero and section titles
- **Monospace**: JetBrains Mono (400, 500) - wallet addresses, token amounts, technical identifiers

**Hierarchy**:
- Hero headline: 4xl-6xl (Space Grotesk Bold)
- Section titles: 2xl-3xl (Space Grotesk Semibold)
- Dashboard metrics: xl-2xl (Inter Semibold) for primary numbers
- Card titles: lg-xl (Inter Semibold)
- Body text: base-lg (Inter Regular)
- Data labels/captions: sm-base (Inter Medium)
- Technical details: sm (JetBrains Mono)

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16, 20** (as in p-4, gap-6, mb-12, py-20)
- Micro spacing: 2-4 (tight elements within components)
- Component internal: 4-8 (card padding, element gaps)
- Section spacing: 12-20 (vertical rhythm between major sections)
- Page margins: 16-20 (desktop containers)

**Grid Strategy**:
- Landing hero: Full-width with centered max-w-6xl content
- Dashboard: Sidebar navigation (w-64) + main content area
- Metrics grid: 3-4 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Card grids: 2-3 columns for RWA project listings
- Single column: max-w-4xl for forms and detailed analysis views

## Component Library

**Navigation**:
- Sticky top navbar: Logo left, wallet connection right, transparent backdrop blur
- Sidebar (dashboard): Vertical navigation with icons + labels, glassmorphic background
- Breadcrumbs: For deep navigation in analysis sections

**Cards & Containers**:
- Glassmorphic cards: Dark background (bg-slate-900/40), backdrop-blur, subtle border (border-slate-700/50)
- Metric cards: Large number display, label, percentage change indicator with color-coded trend arrows
- Project cards: Thumbnail, title, risk score badge, key metrics row, CTA button
- Analysis panels: Collapsible sections with category headers

**Data Visualization**:
- Risk score gauge: Circular progress indicator (0-100 scale) with color gradient (red→yellow→green)
- Bar charts: Horizontal bars for category breakdowns (Financial, Team, Market, Compliance, Technical)
- Line charts: Historical performance tracking with grid lines and tooltips
- Stat bars: Small inline progress indicators showing relative values

**Forms & Inputs**:
- Dark input fields: bg-slate-800/50 with border-slate-600, focus state with gradient border
- File upload: Drag-and-drop zone with dashed border and upload icon
- Select dropdowns: Custom styled with arrow icons
- Submit buttons: Gradient backgrounds (purple→blue) with glow effect on hover

**Badges & Labels**:
- Risk level badges: Color-coded pills (Low=green, Medium=yellow, High=orange, Critical=red)
- Asset type tags: Outlined badges for categorization (Real Estate, Bonds, Invoices)
- Status indicators: Dot + label for active/pending/completed states

**Buttons**:
- Primary CTA: Gradient background (bg-gradient-to-r from-purple-600 to-blue-600), rounded-lg, px-8 py-3
- Secondary: Outlined with gradient border, transparent background
- Wallet connect: Icon + text, prominent placement, pulsing dot indicator when connected
- Icon buttons: Rounded-full, hover scale effect for actions

**Special Components**:
- Alert banners: Top of dashboard for significant risk changes, dismissible
- Tooltip overlays: On hover for metric explanations
- Modal dialogs: Centered, dark backdrop, glassmorphic container for detailed reports
- Loading skeletons: Animated placeholders for data fetching states

## Images

**Hero Section**: 
Full-width gradient mesh background (abstract purple/blue waves suggesting data flows and blockchain networks). Overlay with semi-transparent particles or grid pattern. Place hero content (headline, description, CTA) in left 50% with right 50% showing floating, animated 3D isometric illustration of interconnected data nodes and asset tokens. Image should be high-resolution, futuristic, and convey trust + innovation.

**Dashboard Thumbnails**:
RWA project cards require thumbnail images (300x200px) showing representative assets: real estate properties (architectural renders), bond certificates (stylized document icons), or invoice graphics. These can be placeholder illustrations with gradient overlays matching risk scores.

**Empty States**:
Illustration for "no projects analyzed yet" - friendly, minimalist icon of magnifying glass over document, centered with explanatory text below.

**Integration Logos**:
Mantle Network logo, Chainlink oracle logo, OpenAI logo displayed in "Powered by" footer section or technology stack showcase on landing page.