/**
 * Vectorshades Project One - single entry point.
 * Serves the Next.js frontend (dashboard + /admin) and the Express API (/api)
 * from one process on one port.
 *
 *   node server.js         production (requires `npm run build` first)
 *   node server.js --dev   development with hot reload
 */
const dev = process.argv.includes("--dev");
process.env.NODE_ENV = dev ? "development" : "production";

const http = require("http");
const bcrypt = require("bcryptjs");
const config = require("./src/config");
const db = require("./src/db");
const { createApp } = require("./src/app");

async function main() {
  await db.connect(config.mongoUri);
  await db.seedOnce();

  // Store only a bcrypt hash of the admin password in memory.
  const passwordHash = config.adminPasswordHash || (await bcrypt.hash(config.adminPassword, 12));
  config.adminPassword = undefined;

  // Next.js is installed in ../frontend, so resolve it from there.
  const next = require(require.resolve("next", { paths: [config.frontendDir] }));
  const server = http.createServer();
  const nextApp = next({ dev, dir: config.frontendDir, hostname: "localhost", port: config.port, httpServer: server });
  const handle = nextApp.getRequestHandler();

  try {
    await nextApp.prepare();
  } catch (err) {
    if (!dev && /production build/i.test(String(err?.message))) {
      console.error("[server] No frontend build found. Run `npm run build` first (or `npm run dev`).");
      process.exit(1);
    }
    throw err;
  }

  const app = createApp({ config, passwordHash, pageHandler: handle });
  server.on("request", app);

  server.listen(config.port, config.host, () => {
    console.log(`[server] VS Project One (${dev ? "development" : "production"}) listening on http://${config.host}:${config.port}`);
    console.log(`[server] Dashboard: http://localhost:${config.port}   Admin: http://localhost:${config.port}/admin`);
  });

  const shutdown = async () => {
    server.close();
    await db.mongoose.disconnect().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
