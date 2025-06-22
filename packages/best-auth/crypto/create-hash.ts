type EncodingFormat = "none" | "hex" | "base64";
type SHAFamily = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
type TypedArray =
  | Uint8Array | Uint16Array | Uint32Array
  | Int8Array  | Int16Array  | Int32Array
  | Float32Array | Float64Array;

function base64Encode(bytes: TypedArray): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
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
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    case "base64":
      return base64Encode(bytes);
    default:
      throw new Error("Unsupported encoding type");
  }
}

export function createHash<Encoding extends EncodingFormat = "none">(
  type: SHAFamily,
  encoding?: Encoding
) {
  return {
    async digest(
      input: string | ArrayBuffer | TypedArray
    ): Promise<Encoding extends "none" ? ArrayBuffer : string> {
      let data: ArrayBuffer;

      if (typeof input === "string") {
        data = new TextEncoder().encode(input);
      } else if (ArrayBuffer.isView(input)) {
        data = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
      } else {
        data = input;
      }

      const hash = await crypto.subtle.digest(type, data);

      if (encoding === "none" || encoding === undefined) {
        return hash as any;
      }

      return encode(hash, encoding) as any;
    }
  };
}
