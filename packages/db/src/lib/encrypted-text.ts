import { customType } from "drizzle-orm/pg-core";
import { encryptField, decryptField } from "./encryption";

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
