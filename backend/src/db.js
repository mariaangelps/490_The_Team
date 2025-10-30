// backend/src/db.js
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    family: 4, // evita líos IPv6
  });
  console.log("✅ MongoDB connected:", mongoose.connection.host);
}

export function wireDBSignals() {
  const c = mongoose.connection;
  c.on("error", (e) => console.error("❌ Mongo error:", e?.message || e));
  c.on("disconnected", () => console.warn("⚠️ Mongo disconnected"));
  process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("🔌 Mongo closed");
    process.exit(0);
  });
}
