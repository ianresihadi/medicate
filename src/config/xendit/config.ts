import { registerAs } from "@nestjs/config";

export default registerAs("xendit", () => ({
  secretKey: process.env.XENDIT_SECRET_KEY,
  webhookToken: process.env.XENDIT_WEBHOOK_TOKEN,
}));
