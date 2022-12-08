import { registerAs } from "@nestjs/config";
export const configurationMongo = registerAs("mongo", () => ({
  ip: process.env.MONGO_IP,
  port: process.env.MONGO_PORT,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
  database: process.env.MONGO_DATABASE,
}));