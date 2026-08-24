# Project Conventions

This file supports the `gifello-nestjs-backend` skill with repo-specific backend conventions.

## Structure

- `src/modules/auth/v1/*.controller.ts`
- `src/modules/<module>/v1/*.controller.ts`
- `src/modules/<module>/*.service.ts`
- `src/database/prisma/*` for Prisma module/service
- `src/docs/swagger/*` for Swagger bootstrap
- `docs/postman/*` for Postman assets

## API Versioning

- URI versioning is enabled in `src/main.ts`
- Current public routes are under `/v1/...`
- New versions should be added as new controller folders such as `v2/`

## Documentation

- Swagger UI path is configured by `SWAGGER_PATH`
- Keep Swagger tags and operation summaries current
- If a new endpoint is added or a contract changes, keep the Postman collection aligned

## Auth

- JWT access token auth is the default protected flow
- `JwtAuthGuard` protects authenticated endpoints
- `CurrentUser` provides the authenticated principal
- Session and refresh token handling live in `src/modules/auth/auth.service.ts`

## Prisma

- Prefer explicit return types in services when editor or ESLint inference gets noisy
- Schema changes should be paired with migrations
- Keep seed data aligned with login examples and Postman requests

## Validation

- Run `npm run lint`
- Run `npm run build`
- When Prisma schema changes, also run the Prisma commands already used in this repository
