# Connect pgAdmin 4 to Your Database

Use the same PostgreSQL instance as your app (from `.env`).

## 1. Get connection values from `.env`

Your `DATABASE_URL` looks like:

```
postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

Parse it:

| pgAdmin field | From URL |
|---------------|----------|
| **Host**      | `HOST` (e.g. `db.prisma.io`) |
| **Port**      | `PORT` (usually `5432`) |
| **Database**  | `DATABASE` (e.g. `postgres`) |
| **Username**  | `USER` (the part before the first `:`) |
| **Password**  | `PASSWORD` (the part between first `:` and `@`) |

SSL is required for hosted DBs (e.g. Prisma Data Platform): use **SSL mode = Require**.

## 2. Add server in pgAdmin 4

1. Open **pgAdmin 4**.
2. Right‑click **Servers** → **Register** → **Server**.
3. **General** tab:
   - **Name**: e.g. `Voxo Local` or `Voxo Prisma`.
4. **Connection** tab:
   - **Host**: from `DATABASE_URL` (e.g. `db.prisma.io`).
   - **Port**: `5432` (or the port in your URL).
   - **Maintenance database**: same as **Database** (e.g. `postgres`).
   - **Username**: from `DATABASE_URL`.
   - **Password**: from `DATABASE_URL`.
   - **Save password**: optional (check if you want it stored).
5. **SSL** tab (required for Prisma / most cloud DBs):
   - **SSL mode**: **Require**.
6. Click **Save**.

## 3. Browse your data

- Expand **Servers** → your server → **Databases** → your database (e.g. `postgres`).
- **Schemas** → **public** → **Tables**: you should see `User`, `Tweet`, `Follow`, `Like` after migrations have been applied.

## 4. If connection fails

- **SSL**: set SSL mode to **Require** (or **Verify-full** if the host requires it).
- **Firewall**: ensure your IP is allowed (e.g. in Prisma Data Platform / your cloud provider).
- **Credentials**: re‑copy username and password from `.env` (no extra spaces or quotes).

---

Your migrations live in `prisma/migrations/`. Apply them with:

```bash
npm run db:migrate:dev    # create and apply migrations (dev)
npm run db:migrate:deploy # apply existing migrations (e.g. production)
```

After they’re applied, the same tables will appear in pgAdmin 4.
