import { alphabet } from "./constants/common";
import crypto from "node:crypto";


export function generateCouponCode(options?: {
    length?: number;
    type?: "ticket" | "article";
  }) {
    const length = options ? options.length || 5 : 5;
    const type = options ? options.type || "ticket" : "ticket";

    const prefix = type === "ticket" ? "TC-" : "AC-";
    const bytes = crypto.randomBytes(length);
    let code = "";
    for (let i = 0; i < length; i++) {
      code += alphabet[bytes[i] % alphabet.length];
    }

    return prefix + code;
  }