# Vectorshades Project One

Vectorshades Project One is a web dashboard with one card per company application. It also has an admin panel where those applications are managed.

| Page | URL |
| --- | --- |
| Dashboard | `http://192.168.3.13:5005` |
| Admin panel | `http://192.168.3.13:5005/admin` |

**Stack:** Next.js 16 + React 19 + Tailwind CSS 4 (frontend), Node.js + Express 5 (backend), MongoDB via Mongoose, and session-based authentication (`express-session` with sessions stored in MongoDB).

---

## How it works

The whole app runs as **one Node.js process on one port (5005)**. [backend/server.js](backend/server.js) is the entry point:

1. It connects to MongoDB. On the very first start it seeds the five default applications.
2. Express handles `/api/*`.
3. Every other request goes to Next.js, which serves the dashboard and `/admin`.

The server listens on `0.0.0.0`, so other computers on the local network can reach it.

```
VS Project One/
├── package.json              # convenience scripts (setup / build / start / dev)
├── backend/
│   ├── server.js             # entry point: Express + Next.js on one port
│   ├── .env                  # configuration (not committed)
│   ├── .env.example
│   ├── scripts/hash-password.js
│   └── src/
│       ├── config.js         # loads and validates .env
│       ├── db.js             # MongoDB connection + one-time seeding
│       ├── app.js            # Express app, security headers, sessions, routes
│       ├── validation.js     # input validation for applications
│       ├── data/defaultApplications.js
│       ├── models/Application.js
│       ├── middleware/security.js   # requireAdmin, same-origin (CSRF) check
│       └── routes/
│           ├── auth.js          # login / logout / session
│           ├── applications.js  # public dashboard list
│           └── admin.js         # protected CRUD
└── frontend/
    └── app/
        ├── page.tsx          # dashboard
        ├── admin/            # admin panel (login, list, add/edit form)
        ├── components/       # header, footer, app card, status badge
        └── lib/              # API client, types, icon set
```

---

## Requirements

- **Node.js 20.9 or newer** (tested with Node 24)
- **MongoDB 6 or newer**, running locally or reachable over the network

## Installation

```bash
cd "C:\Users\Nimish\Documents\python\VS Project One"
npm run setup        # installs backend and frontend dependencies
```

## Configuration

All settings are in **`backend/.env`**. Copy `backend/.env.example` if the file is missing.

| Variable | Description |
| --- | --- |
| `PORT` | Port for the whole application. Default `5005`. |
| `HOST` | Interface to listen on. `0.0.0.0` makes the app reachable from other computers on the network. |
| `MONGODB_URI` | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/project_one`. |
| `ADMIN_PASSWORD` | Admin password. Wrap it in quotes if it contains special characters, e.g. `ADMIN_PASSWORD="r&d@vsadmin123"`. |
| `ADMIN_PASSWORD_HASH` | *Optional* replacement for `ADMIN_PASSWORD`: a bcrypt hash, so the plain password is never stored on disk. Generate one with `npm run hash-password --prefix backend -- "your-password"`. |
| `SESSION_SECRET` | Long random string (at least 32 characters) used to sign session cookies. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `SESSION_MAX_AGE_HOURS` | Admin session idle timeout. Default `8`. Every request renews it. |
| `COOKIE_SECURE` | Set to `true` only when the site is served over HTTPS. |

The server refuses to start if `MONGODB_URI`, `SESSION_SECRET` or the admin password is missing.

## Running

### Production (recommended for the server)

```bash
npm run build        # build the frontend (repeat after any frontend change)
npm start            # starts on http://0.0.0.0:5005
```

### Development (hot reload)

```bash
npm run dev
```

On startup you should see:

```
[db] Connected to MongoDB (project_one)
[server] Vectorshades Project One (production) listening on http://0.0.0.0:5005
```

### Network access (Windows Firewall)

If other computers cannot open the dashboard, allow inbound traffic on port 5005. Run this in an **administrator** PowerShell:

```powershell
New-NetFirewallRule -DisplayName "Project One (5005)" -Direction Inbound -Protocol TCP -LocalPort 5005 -Action Allow
```

### Keeping it running (optional)

To run the app in the background and start it automatically after a reboot, you can use a process manager such as [PM2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
cd backend && pm2 start server.js --name project-one && pm2 save
```

---

## Using the admin panel

1. Open `http://192.168.3.13:5005/admin` and sign in with the admin password.
2. From there you can:
   - **Add Application**: enter a name, description and URL, then choose an icon, status and visibility.
   - **Edit** (pencil icon): change any of those details.
   - **Enable / Disable** (switch): disabled applications are hidden from the dashboard but kept in the database.
   - **Status**:
     - *Available* shows the "Open Application" button.
     - *Coming Soon* and *Under Maintenance* show the card with a badge and a disabled button.
   - **Reorder** (arrows): changes the order of the cards on the dashboard.
   - **Delete** (bin icon): removes the application permanently, after a confirmation prompt.
3. Click **Logout** in the header to end the session.

Changes are saved to MongoDB immediately. The dashboard shows them the next time it is opened or refreshed. An open dashboard also updates itself every 60 seconds and whenever its browser tab is brought back into focus.

## API reference

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Health check |
| GET | `/api/applications` | – | Enabled applications for the dashboard |
| POST | `/api/auth/login` | – | `{ "password": "…" }` → sets the session cookie |
| POST | `/api/auth/logout` | – | Ends the session |
| GET | `/api/auth/session` | – | `{ "authenticated": true/false }` |
| GET | `/api/admin/applications` | admin | All applications, including disabled ones |
| POST | `/api/admin/applications` | admin | Create an application |
| PUT / PATCH | `/api/admin/applications/:id` | admin | Update an application (full or partial) |
| PUT | `/api/admin/applications/order` | admin | `{ "ids": [...] }` → set the display order |
| DELETE | `/api/admin/applications/:id` | admin | Delete an application |

Application fields:

| Field | Type / values |
| --- | --- |
| `name` | string |
| `description` | string |
| `url` | http(s) URL |
| `icon` | icon key |
| `status` | `available`, `coming_soon` or `maintenance` |
| `enabled` | boolean |
| `order` | integer |

## Security

- **Admin password:** read only by the backend from `.env` and never sent to the browser. At startup it is bcrypt-hashed in memory, and logins are checked against that hash. You can store only a hash on disk with `ADMIN_PASSWORD_HASH`.
- **Login brute force:** limited to 10 failed attempts per 15 minutes per IP address.
- **Sessions:**
  - Stored in MongoDB, so they survive restarts.
  - The cookie (`p1.sid`) is `HttpOnly` and `SameSite=Strict`, and is `Secure` when `COOKIE_SECURE=true`.
  - Each login issues a new session ID, which prevents session fixation.
  - Logout destroys the session.
- **Admin API:** every `/api/admin/*` route requires an authenticated session.
- **Cross-site requests:** state-changing requests from another origin are rejected. This matters because the other apps on the same server (e.g. `:5005`) count as "same-site" for cookies.
- **Input validation:** URLs must be `http://` or `https://`, which blocks `javascript:` links. Coming-soon applications never expose their URL publicly.
- **Headers:** standard security headers are set with `helmet`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `No frontend build found` | Run `npm run build` before `npm start`, or use `npm run dev`. |
| `Failed to start: MongooseServerSelectionError` | MongoDB is not running or `MONGODB_URI` is wrong. On Windows, check the **MongoDB** service in *Services*. |
| `EADDRINUSE :5005` | Another process is using port 5005. Stop it, or change `PORT`. |
| The dashboard works on the server but not on other PCs | Allow port 5005 through Windows Firewall (see above). |
| Need to restore the default applications | Delete the `meta` document `{ _id: "applications-seeded" }` and every document in the `applications` collection, then restart. |
