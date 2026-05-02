import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";

function getKey() {
  const secret = process.env.APP_SECRET;

  if (!secret || secret.length < 24) {
    throw new Error("APP_SECRET_MISSING");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptSecret(value: string) {
  const [ivText, authTagText, encryptedText] = value.split(".");

  if (!ivText || !authTagText || !encryptedText) {
    throw new Error("INVALID_ENCRYPTED_VALUE");
  }

  const decipher = createDecipheriv(algorithm, getKey(), Buffer.from(ivText, "base64"));
  decipher.setAuthTag(Buffer.from(authTagText, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64")),
    decipher.final()
  ]).toString("utf8");
}
