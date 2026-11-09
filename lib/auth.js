import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";

// const uri = process.env.MONGO_URL;
// if (!uri) throw new Error("MONGO_URL is not configured");

// const globalMongo = globalThis;
// const client = globalMongo.__leebazzMongoClient ?? new MongoClient(uri);
// if (!globalMongo.__leebazzMongoClient) globalMongo.__leebazzMongoClient = client;

const client = new MongoClient(process.env.MONGO_URL);
const db = client.db('leebazz');

const localFrontendOrigin = "http://localhost:3000";
const baseURL = process.env.BETTER_AUTH_URL || localFrontendOrigin;
const trustedOrigins = process.env.NODE_ENV === "development"
  ? [...new Set([baseURL, localFrontendOrigin])]
  : [baseURL];



export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 48,
    disableSessionRefresh: true,
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        input: false,
      },
    }
  },
  baseURL,
  trustedOrigins,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_SECRET,
    },
  },
  database: mongodbAdapter(db, { client }),
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })],
});
