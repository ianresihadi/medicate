import { createCipheriv, createDecipheriv } from "crypto";
import * as dotenv from "dotenv";
import * as fs from "fs";

const env = dotenv.parse(fs.readFileSync(".env"));
const initializationVector = Buffer.from(
  env.AES_INITIALIZATION_VECTOR as string,
  "base64"
);
const secretKey = Buffer.from(env.AES_SECRET_KEY as string, "base64");

export function encrypt(value: string): string {
  const cipher = createCipheriv("aes-256-cbc", secretKey, initializationVector);

  return Buffer.concat([cipher.update(value), cipher.final()]).toString(
    "base64"
  );
}

export function decrypt(encryptedValue: string): string {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    secretKey,
    initializationVector
  );

  return Buffer.concat([
    decipher.update(encryptedValue, "base64"),
    decipher.final(),
  ]).toString();
}
