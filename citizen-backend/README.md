# JanSeva AI Backend

Express API for citizen authentication, complaint ownership, status history, and AI-assisted recommendations. The development default stores records in `data/store.json`; set `DATA_FILE` or replace the persistence functions with MongoDB for production.

## Run

```bash
npm install
copy .env.example .env
npm start
```

Health check: `GET /api/health`. Auth routes are under `/api/auth`; complaint routes are under `/api/complaints`.

AI fields are recommendations and remain reviewable by officials. Original complaint text is never overwritten.
