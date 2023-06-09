// /utils/mongodb.js
import { MongoClient } from "mongodb";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    // console.log(cachedDb, 'cached db')
    return { db: cachedDb };
  }

  try {
    // console.log('connecting to db')
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db();
    cachedDb = db;

    return { db };
  } catch (error) {
    console.log(error, "error");
  }
}
