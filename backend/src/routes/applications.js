const express = require("express");
const Application = require("../models/Application");

const router = express.Router();

/** Public list for the dashboard: enabled applications only. */
router.get("/", async (_req, res) => {
  const apps = await Application.find({ enabled: true })
    .sort({ order: 1, createdAt: 1 })
    .select("name description url icon status order")
    .lean();

  res.set("Cache-Control", "no-store");
  res.json(
    apps.map((a) => ({
      id: String(a._id),
      name: a.name,
      description: a.description,
      icon: a.icon,
      status: a.status,
      // Only expose a link when the application can actually be opened.
      url: a.status === "available" ? a.url : "",
    }))
  );
});

module.exports = router;
