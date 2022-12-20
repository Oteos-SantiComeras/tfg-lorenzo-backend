import { registerAs } from "@nestjs/config";
export const configurationAuth = registerAs("auth", () => ({
  secretKey: process.env.AUTH_SECRET_KEY,
}));