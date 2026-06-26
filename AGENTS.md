# `video-gen-client`

Single Angular 21 app (standalone components, SSR, Vitest).

## Commands

| Action        | Command                              | Notes                                   |
| ------------- | ------------------------------------ | --------------------------------------- |
| Dev server    | `npm start` or `ng serve`            | Port 4200, auto-reload                  |
| Build         | `npm run build`                      | Output to `dist/`, prod by default      |
| Test (Vitest) | `npm test` or `ng test`              | Uses `@angular/build:unit-test` builder |
| Watch build   | `npm run watch`                      | Dev config, non-optimized               |
| SSR server    | `npm run serve:ssr:video-gen-client` | Runs Express on `PORT` (default 3000)   |

## Architecture

- **Standalone** — no NgModules; `bootstrapApplication` in `src/main.ts`
- **SSR** — `@angular/ssr` with Express at `src/server.ts`
- **Routing** — `src/app/app.routes.ts` (currently empty)
- **Entry** — `src/main.ts` (browser), `src/main.server.ts` (server), `src/server.ts` (Express)
- **Styles** — plain CSS (`src/styles.css`)
- **Package manager** — npm (not yarn/pnpm)

## Code style

- **Prettier** — config inlined in `package.json`: `printWidth: 100`, `singleQuote: true`, HTML parser `angular`
- **TypeScript** — strict mode (`strict: true`), Angular compiler also strict
- **No ESLint** — no linting config found; format with Prettier only

## Testing

- **Test runner**: Vitest 4 (not Karma)
- **Globals**: `vitest/globals` enabled in `tsconfig.spec.json` — `describe`, `it`, `expect` etc. available without import
- **Location**: `*.spec.ts` files co-located next to their source (e.g. `app.spec.ts`)
- **DOM**: jsdom (`jsdom` in devDependencies)
