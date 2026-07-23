import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

const DB_URL = process.env.DB_URL;

// Some networks/ISPs refuse DNS SRV lookups (querySrv ECONNREFUSED), which
// breaks mongodb+srv:// connection strings. Point the resolver at public DNS
// so Atlas SRV resolution works.
//
// Scoped to SRV URLs only: hosts like Railway/Fly resolve private services via
// internal DNS (*.railway.internal), and overriding the resolver globally would
// break that. Set DNS_OVERRIDE=off to disable entirely.
if (DB_URL?.startsWith("mongodb+srv://") && process.env.DNS_OVERRIDE !== "off") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const client = new MongoClient(DB_URL);
const DATABASE = process.env.DATABASE;

const connectDatabase = async () => {
  try {
    await client.connect();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
};

export { client, DATABASE, connectDatabase };
