import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URL;
if (!uri) throw new Error("MONGO_URL is not configured");

const globalMongo = globalThis;
const client = globalMongo.__leebazzMongoClient ?? new MongoClient(uri);
if (!globalMongo.__leebazzMongoClient) globalMongo.__leebazzMongoClient = client;

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_SECRET,
    },
  },
  database: mongodbAdapter(client.db(), { client }),
});
