import config from "../config";
import { alphabet } from "./constants/common";
import crypto from "node:crypto";

export function generateCouponCode(options?: { length?: number }) {
  function getTimestampIndex(i: number) {
    return i - 1 > 0 ? (i - 1 > 2 ? 2 : i - 1) : 0;
  }

  const timestamp = Date.now().toString().slice(-3);

  const length = options
    ? options.length || config.COUPON_LENGTH
    : config.COUPON_LENGTH;

  const bytes = crypto.randomBytes(Number(length - 3));
  let code = "";
  for (let i = 0; i < length - 3; i++) {
    code +=
      (i + 2) % 2 === 0
        ? alphabet[bytes[i] % alphabet.length] + timestamp[getTimestampIndex(i)]
        : alphabet[bytes[i] % alphabet.length];
  }

  return code.toUpperCase();
}

export function getSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/ /g, "-");
}
