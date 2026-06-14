import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.DB_URL);
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
