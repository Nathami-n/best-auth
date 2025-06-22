import { subtle } from "uncrypto";
import { base64, base64Url } from "./base64";
type EncodingFormat =
  | "none"
  | "hex"
  | "base64"
  | "base64url"
  | "base64url-nopad";
type SHAFamily = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
export type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array;

function base64Encode(bytes: TypedArray): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i: number;

  for (i = 0; i + 3 <= bytes.length; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    result += chars[(chunk >> 18) & 63];
    result += chars[(chunk >> 12) & 63];
    result += chars[(chunk >> 6) & 63];
    result += chars[chunk & 63];
  }

  const remaining = bytes.length - i;
  if (remaining === 1) {
    const chunk = bytes[i] << 16;
    result += chars[(chunk >> 18) & 63];
    result += chars[(chunk >> 12) & 63];
    result += "==";
  } else if (remaining === 2) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8);
    result += chars[(chunk >> 18) & 63];
    result += chars[(chunk >> 12) & 63];
    result += chars[(chunk >> 6) & 63];
    result += "=";
  }

  return result;
}

function encode(buffer: ArrayBuffer, encoding: EncodingFormat): string {
  const bytes = new Uint8Array(buffer);
  switch (encoding) {
    case "hex":
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    case "base64":
      return base64Encode(bytes);
    default:
      throw new Error("Unsupported encoding type");
  }
}

export function createHash<Encoding extends EncodingFormat = "none">(
  algorithm: SHAFamily,
  encoding?: Encoding
) {
  return {
    digest: async (
      input: string | ArrayBuffer | TypedArray
    ): Promise<Encoding extends "none" ? ArrayBuffer : string> => {
      const encoder = new TextEncoder();
      const data = typeof input === "string" ? encoder.encode(input) : input;
      const hashBuffer = await subtle.digest(algorithm, data);

      if (encoding === "hex") {
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        return hashHex as any;
      }

      if (
        encoding === "base64" ||
        encoding === "base64url" ||
        encoding === "base64url-nopad"
      ) {
        if (encoding.includes("url")) {
          return base64Url.encode(hashBuffer, {
            padding: encoding !== "base64url-nopad",
          }) as any;
        }
        const hash_base64 = base64.encode(hashBuffer);
        return hash_base64 as any;
      }

      return hashBuffer as any;
    },
  };
}
