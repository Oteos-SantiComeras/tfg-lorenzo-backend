import { registerAs } from "@nestjs/config";
export const configurationApp = registerAs("app", () => ({
  port: process.env.APP_PORT,
  production: process.env.APP_PRODUCTION,
  populate: process.env.APP_POPULATE,
  serverPath: process.env.APP_SERVER_URL,
}));