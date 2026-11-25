/** Reject API calls from admin sessions that are not logged in. */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) return next();
  return res.status(401).json({ error: "Authentication required." });
}

/**
 * CSRF defence for state-changing requests: browsers always send an Origin
 * header on cross-origin POST/PUT/PATCH/DELETE, so if one is present it must
 * match the host serving this app. (Other apps on the same IP, e.g. :5005,
 * count as "same-site" for cookies, so SameSite alone is not enough.)
 */
function sameOriginOnly(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin) return next();
  try {
    if (new URL(origin).host === req.get("host")) return next();
  } catch {
    /* fall through */
  }
  return res.status(403).json({ error: "Cross-origin request blocked." });
}

module.exports = { requireAdmin, sameOriginOnly };
