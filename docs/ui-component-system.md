# UI component system

The shared React components live in `apps/web/src/components/ui.tsx` and are re-exported from `apps/web/src/components/index.ts`. Feature components should reuse these primitives so controls share interaction, spacing, and accessibility behavior.

## Shared primitives

| Component | Purpose |
| --- | --- |
| `Button` | Primary, secondary, danger, link, and neutral actions; supports full width and loading states. |
| `TextField`, `PasswordField`, `FormError` | Labeled inputs with hints, associated validation messages, and password visibility. |
| `Checkbox`, `Radio`, `SegmentedControl`, `QuantityStepper` | Selection and quantity controls for product options and forms. |
| `StatusBadge`, `CountBadge`, `Icon` | Compact status, count, and decorative icon presentation. |
| `Card`, `AppShell`, `PageHeader`, `HomeHeader`, `BottomActionBar` | Shared page and content layout. |
| `Skeleton`, `EmptyState`, `InlineBanner` | Loading, empty, and feedback states. |
| `ConfirmDialog`, `ResultDialog` | Confirmation and operation-result dialogs. |
| `CategoryRail`, `SectionTitle` | Menu navigation and section headings. |

## Usage conventions

- Import primitives from `@/components/ui` or the shared component barrel.
- Prefer semantic HTML and native form controls. Give icon-only buttons an accessible name and associate field labels, hints, and errors with their inputs.
- Use the `loading` and `disabled` props to prevent repeat actions; use `aria-live` for changing status text that should be announced.
- Keep business logic and API calls in feature components or hooks; shared UI primitives should remain reusable and presentational.
- Extend the `ButtonVariant` or `IconName` unions when adding a variant or icon so TypeScript checks every use.

## Design tokens

The app uses Tailwind utility classes with BrewLite colors such as `caramel`, `cream`, and `ink`, configured in the web app's global stylesheet. Keep responsive layouts mobile-first and preserve visible keyboard focus styles.
