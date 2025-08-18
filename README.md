# VibeCode - AI-Powered Code Generation Platform

Below are the some amazing output and Demo Videos
<img width="1477" height="767" alt="image" src="https://github.com/user-attachments/assets/260606a2-9753-48d5-b6e3-899b12e7d761" />
<img width="1484" height="762" alt="image" src="https://github.com/user-attachments/assets/0e45f240-91a5-4ebd-94c9-7c93fc388856" />
<img width="1489" height="774" alt="image" src="https://github.com/user-attachments/assets/5fd6fe62-dba8-41b4-8c5c-4c56ddbb9174" />
<img width="1480" height="768" alt="image" src="https://github.com/user-attachments/assets/1110539d-6867-485e-ae88-c69703bf80dc" />
<img width="1482" height="723" alt="image" src="https://github.com/user-attachments/assets/14650df7-f34e-42d6-9e3d-ad269728b01d" />


VibeCode is an AI-powered platform that enables users to create web applications by chatting with AI. Built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

- **AI Code Generation**: Create applications through natural language prompts
- **Real-time Preview**: Live sandbox environments for generated code
- **Project Management**: Organize and manage AI-generated projects
- **Image Support**: Upload and integrate images
- **Code Exploration**: Browse generated code with syntax highlighting
- **Authentication**: Secure user authentication with Clerk
- **Usage Tracking**: Credit system with free and pro tiers
- **Dark/Light Mode**: Full theme support

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma, PostgreSQL, Clerk Auth
- **AI**: Azure OpenAI, Inngest Agent Kit, E2B Sandboxes
- **Storage**: Azure Blob Storage
- **UI**: Shadcn/UI, Radix UI, Lucide Icons

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (home)/             # Home page
│   ├── projects/           # Project management
│   └── api/                # API routes
├── components/             # Reusable UI components
├── modules/                # Feature modules
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
├── trpc/                   # API configuration
├── inngest/                # AI agents
└── prisma/                 # Database schema
```

## � Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Azure OpenAI API access
- Clerk authentication setup
- E2B API access

### Installation
```bash
git clone https://github.com/Junaid1240651/VibeCode.git
cd vibecode
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Azure OpenAI
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="https://..."

# Azure Blob Storage  
AZURE_STORAGE_CONNECTION_STRING="..."

# E2B & Inngest
E2B_API_KEY="..."
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
```

## � API Documentation

### tRPC Routes

**Projects**
- `projects.getOne({ id })` - Get single project
- `projects.getMany()` - Get user's projects  
- `projects.create({ value, images? })` - Create new project

**Messages**
- `messages.getMany({ projectId })` - Get project messages
- `messages.create({ value, projectId, images? })` - Create message

**Usage**
- `usage.status()` - Get current usage status

### REST Endpoints
- `POST /api/upload-image` - Upload images to Azure Blob Storage
- `POST /api/inngest` - Webhook for AI agent jobs

## 🚀 Deployment

Deploy to Vercel (recommended):
```bash
npm run build
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript best practices
4. Submit a pull request

## 🐛 Troubleshooting

**Build Issues:**
```bash
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
```

**Database Issues:**
```bash
npx prisma db push
npx prisma studio
```

---

**VibeCode** - Transform your ideas into code with AI.
