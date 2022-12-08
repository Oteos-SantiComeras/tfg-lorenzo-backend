import { registerAs } from "@nestjs/config";
export const configurationEmailer = registerAs("emailer", () => ({
  address: process.env.EMAILER_EMAIL,
  password: process.env.EMAILER_PASSWORD,
}));