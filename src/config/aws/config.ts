import { registerAs } from "@nestjs/config";

export default registerAs("aws", () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.AWS_BUCKET,
  defaultRegion: process.env.AWS_DEFAULT_REGION,
  bucketUrl: process.env.AWS_BUCKET_URL,
}));
