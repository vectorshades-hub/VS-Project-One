const mongoose = require("mongoose");
const Application = require("./models/Application");
const defaultApplications = require("./data/defaultApplications");

async function connect(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
}

/**
 * Seed the default applications exactly once. A marker document records that
 * seeding happened, so deleting every application later does not re-seed.
 */
async function seedOnce() {
  const meta = mongoose.connection.db.collection("meta");
  if (await meta.findOne({ _id: "applications-seeded" })) return;

  if ((await Application.estimatedDocumentCount()) === 0) {
    await Application.insertMany(defaultApplications);
    console.log(`[db] Seeded ${defaultApplications.length} default applications`);
  }
  await meta.insertOne({ _id: "applications-seeded", at: new Date() });
}

module.exports = { connect, seedOnce, mongoose };
