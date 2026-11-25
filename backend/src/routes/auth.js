const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");

const SESSION_COOKIE = "p1.sid";

/** @param {{ passwordHash: string }} options */
function createAuthRouter({ passwordHash }) {
  const router = express.Router();

  // Slow down password guessing: 10 failed attempts per 15 minutes per IP.
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many login attempts. Please try again in 15 minutes." },
  });

  router.post("/login", loginLimiter, async (req, res, next) => {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!password || password.length > 200 || !(await bcrypt.compare(password, passwordHash))) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    // New session id on login prevents session fixation.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.isAdmin = true;
      req.session.loginAt = Date.now();
      req.session.save((saveErr) => (saveErr ? next(saveErr) : res.json({ authenticated: true })));
    });
  });

  router.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie(SESSION_COOKIE, { path: "/" });
      res.json({ authenticated: false });
    });
  });

  router.get("/session", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ authenticated: req.session?.isAdmin === true });
  });

  return router;
}

module.exports = { createAuthRouter, SESSION_COOKIE };
