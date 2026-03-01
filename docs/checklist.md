# Base UI Migration Checklist

This checklist tracks migrating interactive UI controls in `ui/src` from custom/native HTML controls to Base UI components.

## Scope and Ground Rules

- [ ] Confirm target package/version: `@base-ui/react` (currently installed in `ui/package.json`).
- [ ] Keep existing visual design/tokens; only replace interaction primitives and accessibility mechanics.
- [ ] Prefer shared wrappers in `ui/src/components` to avoid repeating Base UI boilerplate across pages.
- [ ] Add/adjust tests for each migrated component.

## Foundation: Shared Components First

- [x] Replace `ui/src/components/Dialog/Dialog.tsx` custom portal dialog with Base `Dialog` (and `Alert Dialog` pattern for destructive confirmations).
- [x] Replace `ui/src/components/Toast/Toast.tsx` + `ui/src/lib/toast.tsx` rendering path with Base `Toast` primitives.
- [x] Replace `ui/src/components/RealmSelector/RealmSelector.tsx` native `<select>` with Base `Combobox` (or Base `Select` if filtering is intentionally not needed).
- [x] Replace TopNav account menu in `ui/src/components/TopNav/TopNav.tsx` with Base `Menu`.
- [x] Replace TopNav theme toggle in `ui/src/components/TopNav/TopNav.tsx` with Base `Switch` or `Toggle`.
- [ ] Decide wizard strategy for `ui/src/components/Wizard/Wizard.tsx`: keep custom or recompose using Base `Tabs` + `Progress` + `Button` primitives.

## Cross-Cutting Form Primitives

- [ ] Introduce reusable field wrappers (Base `Field`, `Input`, `Number Field` where applicable) for consistent label/error/description handling.
- [ ] Standardize segmented-choice controls with Base `Radio Group` or `Toggle Group`.
- [ ] Standardize scrollable relation/list containers with Base `Scroll Area` where custom overflow sections are currently used.

## Page-by-Page Migration Checklist

### Login and Onboarding

- [x] `ui/src/pages/login/+Page.tsx`: migrate form and PAT input to Base `Form` + `Field` + `Input`; replace submit with Base `Button`.
- [x] `ui/src/pages/onboarding/+Page.tsx`: migrate `FormField` inputs to Base `Field` + `Input`; use Base `Button` for wizard actions/copy action.
- [ ] `ui/src/pages/onboarding/+Page.tsx`: if wizard is refactored, align step indicators/actions with chosen Base primitives.

### Rune Creation and Detail

- [x] `ui/src/pages/runes/new/+Page.tsx`: migrate title/branch/filter text inputs to Base `Field` + `Input`.
- [x] `ui/src/pages/runes/new/+Page.tsx`: migrate relationship picker (`<select>`) to Base `Combobox`.
- [x] `ui/src/pages/runes/new/+Page.tsx`: migrate priority/status segmented buttons to Base `Radio Group` or `Toggle Group`.
- [x] `ui/src/pages/runes/new/+Page.tsx`: migrate relationship list scroller to Base `Scroll Area`.
- [x] `ui/src/pages/runes/@id/+Page.tsx`: use migrated shared Base dialog for delete confirmation (remove custom dialog usage dependency).
- [x] `ui/src/pages/runes/@id/+Page.tsx`: convert action buttons to standardized Base `Button` variant usage.

### Rune List and Dashboard

- [x] `ui/src/pages/runes/+Page.tsx`: migrate status filter strip to Base `Toggle Group` (or `Tabs`, if semantics fit).
- [x] `ui/src/pages/runes/+Page.tsx`: keep table/card structure, but standardize top action controls with Base `Button` + migrated `RealmSelector`.
- [x] `ui/src/pages/dashboard/+Page.tsx`: standardize action controls (`View All Runes`) with Base `Button`.

### Realm Creation, List, and Detail

- [x] `ui/src/pages/realms/new/+Page.tsx`: migrate name input to Base `Field` + `Input`.
- [x] `ui/src/pages/realms/new/+Page.tsx`: evaluate textarea handling (Base has no dedicated textarea primitive; keep native `textarea` with shared field wrapper).
- [x] `ui/src/pages/realms/new/+Page.tsx`: migrate step nav/action buttons to Base `Button`.
- [x] `ui/src/pages/realms/+Page.tsx`: migrate status filter strip to Base `Toggle Group`.
- [x] `ui/src/pages/realms/+Page.tsx`: migrate create button to Base `Button`.
- [x] `ui/src/pages/realms/@id/+Page.tsx`: use migrated shared Base dialog for delete flow.
- [x] `ui/src/pages/realms/@id/+Page.tsx`: standardize action controls with Base `Button`.

### Account Creation, List, and Detail

- [x] `ui/src/pages/accounts/new/+Page.tsx`: migrate username input to Base `Field` + `Input`.
- [x] `ui/src/pages/accounts/new/+Page.tsx`: migrate realm select to Base `Combobox` (or `Select` if fixed/small options).
- [x] `ui/src/pages/accounts/new/+Page.tsx`: migrate role picker button grid to Base `Radio Group` or `Toggle Group`.
- [x] `ui/src/pages/accounts/new/+Page.tsx`: migrate navigation/submit actions to Base `Button`.
- [x] `ui/src/pages/accounts/+Page.tsx`: migrate status filter strip to Base `Toggle Group`.
- [x] `ui/src/pages/accounts/+Page.tsx`: migrate create button to Base `Button`.
- [x] `ui/src/pages/accounts/@id/+Page.tsx`: standardize action controls with Base `Button`.

### Current User Account Page

- [x] `ui/src/pages/account/+Page.tsx`: migrate PAT create/copy/revoke controls to Base `Button` variants.
- [x] `ui/src/pages/account/+Page.tsx`: add Base `Alert Dialog` confirmation before revoke action.

### Error Page

- [x] `ui/src/pages/_error/+Page.tsx`: migrate primary action control to Base `Button` for consistency.

## Areas Intentionally Left Custom (Unless Design Changes)

- [ ] Keep data-table layout and card composition custom unless a separate table/layout abstraction is introduced.
- [ ] Keep non-interactive text/layout-only blocks custom.

## Verification Checklist

- [ ] For every migrated file, ensure keyboard navigation and focus management are preserved or improved.
- [x] Validate ARIA semantics for menu/dialog/combobox flows after migration.
- [x] Update impacted tests (`*.spec.tsx`) for component contract changes.
- [x] Run UI tests: `npm test -- --run` in `ui/`.
- [x] Run UI build: `npm run build` in `ui/`.

## Suggested Execution Order

- [ ] 1) Shared primitives (`Dialog`, `Toast`, `RealmSelector`, `TopNav menu/toggle`)
- [x] 2) Form-heavy pages (`login`, `onboarding`, `accounts/new`, `runes/new`, `realms/new`)
- [x] 3) Filter/action strips (`runes`, `realms`, `accounts`)
- [x] 4) Detail-page action consistency (`runes/@id`, `realms/@id`, `account`, `accounts/@id`, `_error`)
- [ ] 5) Final accessibility + regression test pass
