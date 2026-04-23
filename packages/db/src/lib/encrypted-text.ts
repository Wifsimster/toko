import { customType } from "drizzle-orm/pg-core";
import { encryptField, decryptField } from "./encryption";

// Drizzle custom type that transparently encrypts values on write and decrypts
// on read, using AES-256-GCM. Applied to sensitive columns per business rule
// A2 (child first name). Decryption is tolerant: legacy plaintext values are
// returned as-is, allowing a rolling migration.
export const encryptedText = customType<{ data: string; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value: string): string {
    return encryptField(value);
  },
  fromDriver(value: string): string {
    return decryptField(value);
  },
});
