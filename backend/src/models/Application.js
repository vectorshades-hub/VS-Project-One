const mongoose = require("mongoose");

const STATUSES = ["available", "coming_soon", "maintenance"];

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", trim: true, maxlength: 300 },
    url: { type: String, default: "", trim: true, maxlength: 500 },
    icon: { type: String, default: "layout-grid", trim: true },
    status: { type: String, enum: STATUSES, default: "available" },
    // Disabled applications are hidden from the public dashboard.
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "applications" }
);

applicationSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model("Application", applicationSchema);
module.exports.STATUSES = STATUSES;
