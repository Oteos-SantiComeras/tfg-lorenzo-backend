import { registerAs } from "@nestjs/config";
export const configurationSlack = registerAs("slack", () => ({
  token: process.env.SLACK_TOKEN,
  name: process.env.SLACK_NAME,
  appChannel: process.env.SLACK_APP_CHANNEL,
}));