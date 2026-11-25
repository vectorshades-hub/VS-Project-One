const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const { MongoStore } = require("connect-mongo");

const { requireAdmin, sameOriginOnly } = require("./middleware/security");
const { createAuthRouter, SESSION_COOKIE } = require("./routes/auth");
const applicationsRouter = require("./routes/applications");
const adminRouter = require("./routes/admin");

/**
 * Build the Express app. API routes live under /api; every other request is
 * passed to `pageHandler` (the Next.js request handler).
 */
function createApp({ config, passwordHash, pageHandler }) {
  const app = express();
  app.disable("x-powered-by");

  // CSP is left to the page layer; HSTS is pointless over plain-HTTP LAN.
  app.use(helmet({ contentSecurityPolicy: false, hsts: false }));

  const api = express.Router();
  api.use(express.json({ limit: "20kb" }));
  api.use(sameOriginOnly);
  api.use(
    session({
      name: SESSION_COOKIE,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true, // idle timeout: renewed on each request
      store: MongoStore.create({
        mongoUrl: config.mongoUri,
        collectionName: "sessions",
        ttl: Math.ceil(config.sessionMaxAgeMs / 1000),
      }),
      cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: config.cookieSecure,
        maxAge: config.sessionMaxAgeMs,
        path: "/",
      },
    })
  );

  api.get("/health", (_req, res) => res.json({ ok: true }));
  api.use("/auth", createAuthRouter({ passwordHash }));
  api.use("/applications", applicationsRouter);
  api.use("/admin", requireAdmin, adminRouter);
  api.use((_req, res) => res.status(404).json({ error: "Not found." }));

  // eslint-disable-next-line no-unused-vars
  api.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body." });
    if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
    console.error("[api]", err);
    res.status(500).json({ error: "Internal server error." });
  });

  app.use("/api", api);
  app.use((req, res) => pageHandler(req, res));
  return app;
}

module.exports = { createApp };
