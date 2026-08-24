---
name: gifello-nestjs-backend
description: Use when adding or modifying NestJS backend endpoints, services, DTOs, Prisma-backed data access, auth/session flows, Swagger annotations, or Postman collections in the Gifello API.
---

# Gifello NestJS Backend

Use this skill when working on the Gifello NestJS backend codebase.

This skill is for implementation work inside the existing backend structure. It should be used for API changes, Prisma-backed service changes, auth/session updates, Swagger updates, and endpoint-level refactors in this repository.

## Use this skill for

- Adding a new endpoint to an existing NestJS module
- Creating a new controller/service/DTO flow
- Updating request or response shapes
- Changing Prisma-backed service logic
- Updating auth, session, or token-related flows
- Updating Swagger decorators and DTO documentation
- Updating the Postman collection when API behavior changes
- Making backend changes that must follow the current module/versioning conventions

## Do not use this skill for

- Broad repo-wide policy or workflow rules that belong in `AGENTS.md`
- Frontend or mobile app changes
- Infrastructure-only work unless it directly supports a backend API change
- Large architecture redesigns unless the task explicitly requests them

## Project conventions

- Keep modules under `src/modules/<module>`
- Keep API-facing controllers under `src/modules/<module>/v1/`
- Keep business logic in `*.service.ts`
- Keep Prisma access in services, never in controllers
- Add new endpoints under `v1` unless the task explicitly targets a different version
- Preserve the existing route style: `/v1/<module>/...`
- Use DTOs with `class-validator` for request validation
- Use `@nestjs/swagger` decorators on controllers, DTOs, and response models when request or response contracts change
- Prefer explicit response types when complex Prisma payload inference causes IDE or ESLint confusion
- Follow existing naming, folder, and file placement patterns already present in the target module

## Expected workflow

1. Inspect the target module under `src/modules/<module>`
2. Identify the existing controller, service, DTOs, and related Prisma usage
3. Make the smallest correct change that matches the current module structure and versioning style
4. If the change is API-facing, update all affected layers:
   - controller
   - service
   - DTOs
   - Swagger decorators
   - Postman collection if a new endpoint was added or an existing contract changed
5. If the change requires database schema updates, update all affected Prisma files:
   - `prisma/schema.prisma`
   - a new migration under `prisma/migrations`
   - `prisma/seed.ts` if seed data depends on the schema change
6. Validate the result before finishing

## Done when

The task is complete only when all relevant conditions below are true:

- The backend change follows the existing NestJS module and `v1` routing conventions
- Controllers do not contain business logic
- Prisma access is implemented in services
- DTO validation is present where request input changed
- Swagger annotations are updated where request or response contracts changed
- The Postman collection is updated if a new endpoint was added or an endpoint contract changed
- Prisma schema and migrations are updated if the data model changed
- `npm run lint` passes
- `npm run build` passes

## Validation

Run the relevant checks after making changes:

- `npm run lint`
- `npm run build`

When Prisma schema changes:
- run the required Prisma format, validate, generate, and migration commands used in this repository
- confirm the migration is created in `prisma/migrations`
- update `prisma/seed.ts` if needed

## Implementation guidance

- Reuse existing patterns in nearby modules before introducing a new pattern
- Prefer consistency with the current codebase over personal style preferences
- Keep changes scoped to the task
- Avoid unrelated refactors unless they are required to complete the task safely
- Preserve backward compatibility unless the task explicitly allows breaking changes
- Do not move routes out of `v1` unless explicitly requested

## Inputs to expect

This skill works best when the task includes:
- target module name
- endpoint purpose
- request or response contract changes
- related schema or auth/session changes
- whether Swagger or Postman must be updated

## Outputs to produce

When applicable, produce updated versions of:
- controller
- service
- DTOs
- Prisma schema and migration
- Swagger decorators
- Postman collection
- any related seed changes

## References

For repo-specific conventions and shared backend rules, read:
- `references/project-conventions.md`

For broader repository instructions, use:
- `AGENTS.md`