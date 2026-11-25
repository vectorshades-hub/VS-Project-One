const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const { validateApplication } = require("../validation");

const router = express.Router();

const FIELDS = ["name", "description", "url", "icon", "status", "enabled", "order"];

function toDto(doc) {
  const a = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(a._id),
    name: a.name,
    description: a.description,
    url: a.url,
    icon: a.icon,
    status: a.status,
    enabled: a.enabled,
    order: a.order,
    updatedAt: a.updatedAt,
  };
}

function pick(body) {
  const out = {};
  for (const key of FIELDS) if (body && body[key] !== undefined) out[key] = body[key];
  return out;
}

async function findOr404(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: "Application not found." });
    return null;
  }
  const doc = await Application.findById(req.params.id);
  if (!doc) res.status(404).json({ error: "Application not found." });
  return doc;
}

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// List all applications, including disabled ones.
router.get("/applications", async (_req, res) => {
  const apps = await Application.find().sort({ order: 1, createdAt: 1 });
  res.json(apps.map(toDto));
});

// Create.
router.post("/applications", async (req, res) => {
  const input = pick(req.body);
  if (input.order === undefined) {
    const last = await Application.findOne().sort({ order: -1 }).select("order").lean();
    input.order = (last?.order ?? 0) + 1;
  }
  const { data, error } = validateApplication(input);
  if (error) return res.status(400).json({ error });
  const created = await Application.create(data);
  res.status(201).json(toDto(created));
});

// Reorder: body { ids: [id1, id2, ...] } in the desired display order.
router.put("/applications/order", async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
  if (!ids || !ids.every((id) => mongoose.isValidObjectId(id))) {
    return res.status(400).json({ error: "ids must be an array of application ids." });
  }
  await Application.bulkWrite(
    ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } } }))
  );
  const apps = await Application.find().sort({ order: 1, createdAt: 1 });
  res.json(apps.map(toDto));
});

// Update (full or partial; unspecified fields keep their current values).
async function update(req, res) {
  const doc = await findOr404(req, res);
  if (!doc) return;
  const merged = { ...pick(doc.toObject()), ...pick(req.body) };
  const { data, error } = validateApplication(merged);
  if (error) return res.status(400).json({ error });
  doc.set(data);
  await doc.save();
  res.json(toDto(doc));
}
router.put("/applications/:id", update);
router.patch("/applications/:id", update);

// Delete.
router.delete("/applications/:id", async (req, res) => {
  const doc = await findOr404(req, res);
  if (!doc) return;
  await doc.deleteOne();
  res.json({ deleted: true, id: String(doc._id) });
});

module.exports = router;
