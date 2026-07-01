# VideoGenClient

[![Angular](https://img.shields.io/badge/Angular-21-red?logo=angular&logoColor=white)](https://angular.io)
[![GitHub](https://img.shields.io/badge/GitHub-Pradeep--1496%2Ftube--forge--client-blue?logo=github)](https://github.com/Pradeep-1496/tube-forge-client)

> Single Angular 21 app (standalone components, SSR, Vitest)

## 📋 About

VideoGenClient is a modern Angular 21 application built with standalone components, Server-Side Rendering (SSR), and Vitest for unit testing.

## 🔗 Repository

Visit the repository: [https://github.com/Pradeep-1496/tube-forge-client](https://github.com/Pradeep-1496/tube-forge-client)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

```bash
npm install
```

### Development server

To start a local development server, run:

```bash
npm start
# or
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Build

To build the project run:

```bash
npm run build
# or
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Watch build

```bash
npm run watch
```

### SSR server

```bash
npm run serve:ssr:video-gen-client
```

Runs Express on `PORT` (default: `3000`).

### Unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test
# or
ng test
```

### End-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## 🏗 Architecture

- **Standalone** — no NgModules; `bootstrapApplication` in `src/main.ts`
- **SSR** — `@angular/ssr` with Express at `src/server.ts`
- **Routing** — `src/app/app.routes.ts`
- **Entry** — `src/main.ts` (browser), `src/main.server.ts` (server), `src/server.ts` (Express)
- **Styles** — plain CSS (`src/styles.css`)
- **Package manager** — npm

## 📝 Code Style

- **Prettier** — config inlined in `package.json`: `printWidth: 100`, `singleQuote: true`, HTML parser `angular`
- **TypeScript** — strict mode (`strict: true`), Angular compiler also strict
- **No ESLint** — format with Prettier only
- **Testing** — Vitest 4 with jsdom, globals enabled

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.2
