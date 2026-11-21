import "dotenv/config";
import dns from "node:dns/promises";
import mongoose from "mongoose";
import app from "./app.js";

// Match DNS resolver setup used on networks with SRV lookup restrictions
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function startServer(): Promise<void> {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();