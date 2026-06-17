import "dotenv/config";
import mongoose from "mongoose";
import { batchInsertNotifications } from "../services/batchInsertService.js";

const TOTAL = parseInt(process.argv[2]) || 500000;
const BATCH_SIZE = parseInt(process.argv[3]) || 5000;

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const count = await mongoose.connection.collection("notifications").countDocuments();
    if (count > 0) {
      console.log(`Collection already has ${count} records. Skipping seed.`);
      process.exit(0);
    }

    console.log(`Seeding ${TOTAL} records in batches of ${BATCH_SIZE}`);
    const inserted = await batchInsertNotifications(TOTAL, BATCH_SIZE);
    console.log(`Done. Inserted ${inserted} records.`);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

run();
