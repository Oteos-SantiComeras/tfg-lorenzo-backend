import { registerAs } from "@nestjs/config";
export const configurationSftp = registerAs("sftp", () => ({
  host: process.env.HOST_SFTP,
  port: process.env.PORT_SFTP,
  username: process.env.USER_SFTP,
  password: process.env.PASSWORD_SFTP,
}));