# Vision2React

![Vision2React Architecture](/frontend/public/Vision2React.excalidraw.png)

Vision2React is an automated design-to-code platform that converts Figma designs into production-ready React components. The system uses AI-powered workers to extract design sections, generate component code, and deploy live previews.

## Architecture Overview

The system consists of three main layers:

### Figma Worker

- Extracts entire design pages from Figma files
- Performs section detection and automatically splits designs into logical components
- Downloads screenshots and images from Figma
- Uploads assets to Cloudflare R2 for permanent storage
- Queues sections for AI processing via Redis

### AI Worker

- Processes sections in parallel using multiple worker agents
- Each worker generates React component code from Figma design data and screenshots
- Supervisor agent validates all worker outputs
- Aggregator agent combines individual components into a cohesive Next.js application
- Implements retry logic for failed validations

### Agentic Graph Layer

![Vision2React Agent Workflow](/frontend/public/dynamic_multi_agent_workflow.png)

Built with LangGraph for orchestrating the AI workflow:

- Dynamic worker creation based on number of sections
- Parallel execution of component generation
- Supervisor validation and quality control
- Final aggregation into complete application

## Multi-Agent Processing

Using LangGraph, the system creates:

- **Worker Agents**: Generate individual section components
- **Supervisor Agent**: Validates outputs and coordinates retries
- **Aggregator Agent**: Combines components into final application

## Tech Stack

### Backend

- **FastAPI** - REST API framework
- **Python 3.10+** - Core language
- **LangGraph** - AI workflow orchestration
- **LangChain** - LLM integration (OpenAI, Google, Groq)
- **Redis** - Job queue management
- **Prisma** - Database ORM
- **PostgreSQL** - User data storage
- **E2B** - Sandbox environment for code validation and preview
- **Boto3** - Cloudflare R2 integration

### Frontend

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React 19** - UI library

### Infrastructure

- **Cloudflare R2** - Image and asset storage
- **GitHub OAuth** - Authentication
- **E2B Sandbox** - Live preview generation

## Features

### Design Processing

- Automatic section detection from Figma designs
- Export detection for icons and graphics
- Image optimization and cloud storage
- Screenshot generation for visual context

### AI Code Generation

- Context-aware component generation
- Multi-modal prompts with design screenshots
- Parallel processing for faster generation
- Validation and retry mechanisms

### Live Preview

- Instant Next.js deployment in E2B sandbox
- Real-time component preview
- Automatic dependency management
- Remote image configuration

### GitHub Integration

- OAuth authentication
- Direct code push to repositories
- Automatic repository creation
- Commit history tracking

## API Endpoints

### Authentication

- `GET /auth/github/login` - Initiate GitHub OAuth flow
- `GET /auth/github/callback` - Handle OAuth callback

### Figma Processing

- `POST /api/figma` - Submit Figma URL for processing
- `GET /api/status/{file_key}` - Check processing status
- `GET /api/preview/{file_key}` - Get preview URL

### GitHub Operations

- `GET /api/github/repos?user_id={id}` - List user repositories
- `POST /api/github/push-code` - Push generated code to GitHub

## Workflow

1. **User Input**: User provides Figma design URL and authenticates via GitHub
2. **Figma Extraction**: System extracts design data, detects sections, and downloads assets
3. **Section Extraction**: Design is split into logical sections (Header, Nav, Features, etc.)
4. **Context Engineering**: Each section gets enriched with screenshots and image mappings
5. **Parallel Processing**: Multiple AI workers generate component code simultaneously
6. **Validation**: Supervisor validates all generated components
7. **Aggregation**: Components are combined into a complete Next.js application
8. **Sandbox Preview**: Code is deployed to E2B sandbox for instant preview
9. **GitHub Push**: User can push code to their GitHub repository

## Configuration

### Backend Environment Variables

```bash
# Figma
FIGMA_ACCESS_TOKEN=

# LLM Providers
OPENAI_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=

# Database
DATABASE_URL=

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# E2B
E2B_API_KEY=
E2B_TEMPLATE_ID=

# Cloudflare R2
ACCOUNT_ID=
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=
```

### Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Installation

### Backend Setup

```bash
cd backend

# Install dependencies
pip install uv
uv pip install -r pyproject.toml

# Generate Prisma client
prisma generate

# Run migrations
prisma migrate dev

# Start backend server
python main.py
```

### Worker Setup

```bash
cd backend

#Start main server
uv run python main.py

# Start workers in another terminal
uv run python worker/main.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
Vision2React/
├── backend/
│   ├── config/              # Application settings
│   ├── data/                # Figma extracted data
│   ├── exports/             # Shared utilities (Redis, Prisma)
│   ├── prisma/              # Database schema
│   ├── routes/              # API endpoints
│   └── worker/
│       ├── ai/              # AI code generation
│       │   ├── graph/       # LangGraph workflow
│       │   └── services/    # LLM, E2B, prompts
│       └── figma/           # Figma processing
│           ├── controllers/ # Main handlers
│           └── services/    # Figma client, exports
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## How It Works

### Section Detection

The system analyzes Figma frame hierarchies to identify logical sections based on naming conventions and structure. Each section is processed independently for better component modularity.

### Context Engineering

Before code generation, the system enriches each section with:

- Full design screenshot for visual context
- Section-specific screenshot
- Structured Figma data (layout, colors, typography)
- Image references with cloud URLs

## Sandbox Preview

E2B sandboxes provide:

- Isolated Next.js environment
- 30-minute timeout for previews
- HTTPS URLs for secure access
- File system access for GitHub push

## Use Cases

- Rapid prototyping from designs
- Design system implementation
- Landing page generation
- Component library creation
- Design handoff automation
