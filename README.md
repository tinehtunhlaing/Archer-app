# Archer App

The web client for Archer, maintained as an independent project and Git repository. Built with React, React Router, TanStack Query, Vite, and the shadcn/ui preset `beEhfqy2`.

## Local development

```sh
npm install
cp .env.example .env
npm run dev
```

The app expects the API at `http://localhost:4000/api`. Set `VITE_API_URL` in `.env` to use another API origin. Make sure the API is running and its database has been migrated.

To create the local demo data and accounts, run `npm run db:seed` from the [Archer API repository](https://github.com/tinehtunhlaing/Archer-api).

## Commands

- `npm run dev` — start Vite locally
- `npm run build` — type-check and build production assets
- `npm run preview` — preview a production build
- `npm run lint` — run ESLint

## Auth and money

The MVP stores its short-lived bearer token in `sessionStorage`, so it is cleared when the browser session ends. Job and proposal amounts are sent as decimal strings with a currency code; the app does not convert between currencies or process payments.

The interface is available in English and Burmese. The language selector saves its choice in browser storage. User-authored project, profile, proposal, and message text is shown as written.

## Demo login accounts

Run the API seed command first. These accounts exist only in the local sample database:

| Role | Email | Password |
|---|---|---|
| Client | `seed.client.001@archer.example.test` | `ArcherSample2026!` |
| Freelancer | `seed.freelancer.001@archer.example.test` | `ArcherSample2026!` |
| Admin | `demo.admin@archer.example.test` | `ArcherSample2026!` |

All three use synthetic `.test` email addresses. Admin sign-in works, but admin workflows are not implemented in the web app yet. Do not use these demo credentials outside local development.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
