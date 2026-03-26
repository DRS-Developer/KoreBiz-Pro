# Home V1 Removal Log

## Scope

Complete removal of legacy Home v1 runtime and admin editing paths, keeping only Builder v2.

## Removed Modules

- `src/hooks/useHomeConfig.ts`
- `src/types/home-config.ts`
- `src/components/Admin/Home/SectionManager.tsx`
- `src/components/Admin/Home/SortableSectionItem.tsx`

## Runtime Changes

- `Home.tsx` now loads widgets directly with `useHomeWidgets()`
- `HomeRuntimeRenderer.tsx` no longer accepts legacy sections or mode toggle
- Legacy fallback rendering path was removed
- Added v2 minimal fallback (`hero`, `about`, `cta`) when widget list is empty

## Admin Changes

- `Admin > Home` tabs are now v2-only (`Seções da Home`, `Elementos Visuais`)
- `SectionsTab` no longer switches between legacy/v2
- Widget modal flow is now the only content configuration path

## Settings Changes

- UI toggle for `home_builder_v2_enabled` removed from Settings
- Persisted layout settings now force `home_builder_v2_enabled: true` for compatibility

## Validation

- Type check: `npm run check`
- Builder tests:
  - `npm run test -- src/pages/Admin/Home/index.test.tsx`
  - `npm run test -- src/pages/Admin/Home/tabs/SectionsTab.test.tsx`
  - `npm run test -- src/pages/Admin/Home/tabs/CtaTab.test.tsx`
- Production build: `npm run build`
