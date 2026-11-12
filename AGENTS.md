# Archer project guidance

These instructions apply to the workspace root and every project directory beneath it.

## Documentation boundaries

- `SPEC.md` is the product-facing source of truth for features, workflows, and open product decisions. Product scope may change; do not treat a draft or an open question as a confirmed requirement.
- The root `README.md` is the workspace entry point. Each project's README owns that project's setup, commands, configuration, and user/developer-facing implementation notes.
- This file defines durable technical boundaries and implementation guidance. Keep feature descriptions in `SPEC.md`, not duplicated here.
- `CLAUDE.md` imports this file. Update this shared file instead of maintaining a second set of Claude-specific rules.
- When a project is moved into its own repository, carry the applicable project guidance into that repository so it remains available outside this workspace.

## Project and repository boundaries

- Archer consists of three independently maintained projects: `app`, `api`, and `mobile`. Each has its own dependencies, build, configuration, and release lifecycle.
- Do not introduce cross-project source imports, shared runtime packages, or a root-level application build. Exchange data through the API contract.
- The web and mobile clients must use the API for persistent data and business operations. Neither client accesses the database directly.
- The API owns authorization, input validation, business rules, and database access. Enforce authentication, role, and object-ownership checks on the server for every protected operation.
- Coordinate API contract changes with both clients. Document incompatible changes and keep client behavior aligned with the published API contract.

## Technology boundaries

- `app`: React, React Router, TanStack Query (React Query), and shadcn/ui using preset `beEhfqy2`.
- `api`: Node.js with Express, SQLite, Prisma ORM 7, and JWT-based authentication.
- `mobile`: React Native with Expo. Mobile workflows remain deferred until they are specified in `SPEC.md`.
- Keep each project independently installable and buildable. Do not silently replace or add a core framework, database, ORM, authentication model, or UI foundation; update the relevant project guidance and get the product owner's direction first.

## Data and security invariants

- Represent money with an explicit currency code. The supported codes are `USD` and `MMK`; never infer currency from locale or convert amounts implicitly.
- Avoid binary floating-point for monetary persistence or calculations. Preserve exact decimal values and currency through the API and UI.
- Keep passwords hashed and secrets out of source control, logs, client bundles, and error responses. Use environment variables for local and deployment secrets; update `.env.example` with placeholders only.
- Validate untrusted input at the API boundary and return errors without exposing secrets or internal implementation details.
- Use Prisma migrations for schema changes. Do not make production data changes from a development seed workflow.
- Treat seeded users, jobs, proposals, and messages as synthetic local sample data.

## Implementation guidance

- Read the applicable project README and `SPEC.md` before changing behavior. If implementation and documentation disagree, verify current behavior and update the relevant documentation as part of the change.
- Keep changes within the responsible project. If a feature needs coordinated changes, make the API contract explicit and update each affected project independently.
- Follow existing project conventions and keep changes focused. Add or modify documentation when setup, behavior, environment variables, or commands change.
- Run the relevant typecheck, lint, build, or other project checks for the change and report what was run and its result.
- Never commit real credentials, user data, local database files, generated secrets, or environment-specific configuration.
