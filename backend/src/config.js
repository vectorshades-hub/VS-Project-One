const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

function fail(message) {
  console.error(`[config] ${message}`);
  process.exit(1);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5005,
  host: process.env.HOST || "0.0.0.0",
  mongoUri: process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET,
  sessionMaxAgeMs: (Number(process.env.SESSION_MAX_AGE_HOURS) || 8) * 60 * 60 * 1000,
  cookieSecure: String(process.env.COOKIE_SECURE).toLowerCase() === "true",
  frontendDir: path.resolve(__dirname, "..", "..", "frontend"),
  adminPassword: process.env.ADMIN_PASSWORD,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
};

if (!config.mongoUri) fail("MONGODB_URI is not set in backend/.env");
if (!config.sessionSecret || config.sessionSecret.length < 32) {
  fail("SESSION_SECRET must be set in backend/.env and be at least 32 characters long");
}
if (!config.adminPassword && !config.adminPasswordHash) {
  fail("Set ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) in backend/.env");
}

// Keep the plain-text password out of the environment once it has been read.
delete process.env.ADMIN_PASSWORD;

module.exports = config;
