# JanSeva AI

JanSeva AI is a multilingual citizen grievance prototype for reporting civic issues, tracking resolution, and helping officials triage complaints with explainable AI recommendations.

## Applications

- `citizen-frontend`: React/Vite citizen and official web application.
- `citizen-backend`: Express API with JWT authentication, complaint ownership, status history, and a development JSON persistence adapter.
- `backend`: PostgreSQL-backed JanSeva API used by the collaborator repository.
- `officer-console`: React/Vite municipal officer application.

## Run locally

```powershell
cd citizen-frontend
npm install
npm run dev
```

In another terminal:

```powershell
cd citizen-backend
npm install
copy .env.example .env
npm start
```

For the PostgreSQL-backed API and officer console, use `backend` and `officer-console` respectively. Their package lockfiles are committed with the combined repository.

The frontend defaults to `http://localhost:5000/api`; override it with `VITE_API_BASE_URL`. No secrets belong in source control.

## Prototype workflow

The frontend safely falls back to fixture data and local storage until API calls are connected. Use `demo@janseva.ai` / `demo123` for citizen data, or `official@janseva.ai` / `official123` for the local official desk. These are prototype credentials only.

The backend preserves original complaint text, assigns ownership server-side, stores status history, and produces controlled category, department, priority, language, and summary recommendations. AI output is advisory and can be overridden by an authorized official.

## API

`GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `GET/POST /api/complaints`, `GET /api/complaints/:id`, and `PATCH /api/complaints/:id/status`.

For production, replace the JSON adapter with MongoDB or another managed database, configure a strong `JWT_SECRET`, restrict CORS, and provide a server-side AI provider through environment variables.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# janseva_AI
