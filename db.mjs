import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment");
}

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] Connection error:", err);
    throw err;
  }
}

mongoose.connection.on("error", (err) => {
  console.error("[db] Mongoose error", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[db] Mongoose disconnected");
});
