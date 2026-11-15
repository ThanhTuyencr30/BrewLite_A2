# Automated tests

The root `tests/` directory documents the repository-wide test layout. Tests remain beside their NestJS modules where they can reuse the app's TypeScript/Jest configuration:

- Unit tests: `apps/api/src/**/*.spec.ts`
- API integration tests: `apps/api/src/**/*.integration.spec.ts`
- API E2E tests: `apps/api/test/**/*.e2e-spec.ts`
- Health smoke test: `scripts/smoke-test.mjs`

Run the relevant checks from the repository root:

```powershell
pnpm test
pnpm test:e2e
$env:API_URL = "http://localhost:3001"
pnpm smoke
```

The API E2E/integration suite requires a migrated PostgreSQL database, the Prisma seed catalog and valid test environment variables. CI provisions PostgreSQL, applies migrations and seeds the catalog before running the suite. Use a disposable test database because the checkout journey creates and cancels an order.

The API E2E specs cover registration/login/profile and the menu-to-order-confirmation API journey. This does not replace a browser-based E2E test if the instructor expects the frontend to be exercised in a real browser.
