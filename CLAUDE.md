# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development
npm run dev              # Start dev server with Turbopack at localhost:3000
npm run dev:daemon       # Start in background (logs to logs.txt)

# Build & Production
npm run build
npm run start

# Testing (vitest with jsdom environment)
npm run test             # Run vitest in watch mode
npx vitest run           # Run tests once
npx vitest run path/to/test.test.ts  # Run single test file
npx vitest run -t "test name"        # Run tests matching name pattern

# Linting
npm run lint

# Database
npm run db:reset         # Reset database with fresh migrations
npx prisma studio        # Open Prisma database GUI
```

## Architecture

This is an AI-powered React component generator with live preview. Users describe components in chat, Claude generates code using tools, and components render in a sandboxed iframe.

### Data Flow

```
User Message → ChatProvider (useChat) → POST /api/chat (streaming)
    → Claude API (with tools: str_replace_editor, file_manager)
    → Tool execution updates VirtualFileSystem
    → JSX Transformer (Babel) → Blob URLs + Import Map
    → PreviewFrame (sandboxed iframe)
```

### Key Concepts

**Virtual File System** (`lib/file-system.ts`): All generated code lives in-memory, never written to disk. Serialized as JSON for persistence in database.

**Tool System**: Claude uses two tools to manipulate the virtual file system:
- `str_replace_editor` (`lib/tools/str-replace.ts`): view, create, str_replace, insert operations
- `file_manager` (`lib/tools/file-manager.ts`): rename, delete operations

**JSX Transformation** (`lib/transform/jsx-transformer.ts`): Transpiles JSX with Babel, creates blob URLs for each file, generates import map routing local files and npm packages (via esm.sh CDN).

**Contexts**:
- `ChatProvider` (`lib/contexts/chat-context.tsx`): Manages chat state via Vercel AI SDK's useChat hook
- `FileSystemProvider` (`lib/contexts/file-system-context.tsx`): Wraps VirtualFileSystem, handles tool call results, manages selected file state

### Directory Structure

- `app/` - Next.js App Router pages and API routes
- `app/api/chat/route.ts` - Streaming chat endpoint that calls Claude
- `actions/` - Server actions for auth and project CRUD
- `components/` - React components organized by feature (auth, chat, editor, preview, ui)
- `lib/` - Core utilities, contexts, tools, and transformers
- `lib/prompts/generation.tsx` - System prompt for Claude code generation
- `prisma/` - Database schema (SQLite)

### Authentication

JWT-based sessions using JOSE library. Session stored in httpOnly cookie. Auth functions in `lib/auth.ts`, server actions in `actions/index.ts`.

### Provider Pattern

`lib/provider.ts` returns Claude model or a MockLanguageModel when no API key is set. The mock generates fake responses for demo mode.

## Tech Stack

- Next.js 15 with App Router and Turbopack
- React 19
- TypeScript with strict mode
- Tailwind CSS v4
- Prisma with SQLite
- Vercel AI SDK with Anthropic provider
- Monaco Editor for code editing
- Radix UI for components
