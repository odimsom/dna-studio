# Contributing to DNA Studio

Thanks for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Git

### Getting Started

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/dna-studio.git
cd dna-studio

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL and at least one AI provider key

# Run database migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```

### Using Docker (alternative)

```bash
docker compose up -d
```

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components (layout, ui, brand-dna)
└── lib/
    ├── brand-dna/    # Brand DNA crawler and extractors
    ├── llm/          # LLM client + provider implementations
    ├── image/        # Image generation client + providers
    ├── campaigns/    # Campaign generator and prompts
    ├── settings/     # User settings resolution chain
    ├── social/       # Social media API integrations
    └── auth/         # NextAuth configuration
```

## Code Style

- **TypeScript** throughout — avoid `any` where possible
- **Tailwind CSS v4** for styling (`@theme inline` block for design tokens)
- **Prisma** for database access — never write raw SQL in application code
- Run `npm run lint` before committing

## Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make focused changes** — one feature or fix per PR

3. **Test locally** — verify your changes work with at least one LLM provider

4. **Lint your code**:
   ```bash
   npm run lint
   ```

5. **Build successfully**:
   ```bash
   npm run build
   ```

6. **Commit with clear messages** — describe what and why, not how

7. **Open a PR** against `main`

## Adding a New LLM Provider

1. Create `src/lib/llm/providers/your-provider.ts` implementing the `LLMProvider` interface
2. Add the provider type to `src/lib/llm/client.ts`
3. Add env vars to `.env.example` and `docker-compose.yml`
4. Update `src/lib/settings/resolve.ts` for the new provider

## Adding a New Image Provider

1. Create `src/lib/image/providers/your-provider.ts` implementing the `ImageProvider` interface
2. Add the provider type to `src/lib/image/client.ts`
3. Add env vars to `.env.example` and `docker-compose.yml`
4. Update `src/lib/settings/resolve.ts`

## Database Changes

- Add fields to `prisma/schema.prisma`
- Create a migration file in `prisma/migrations/YYYYMMDD_description/migration.sql`
- Run `npx prisma generate` to update the client

## Reporting Issues

- Use the [bug report template](https://github.com/moesaif/dna-studio/issues/new?template=bug_report.yml)
- Include your deployment method, LLM provider, and relevant logs
- Screenshots are always helpful

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
