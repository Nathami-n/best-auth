import { bytesToHex, hexToBytes } from "@noble/ciphers/utils";
import { scryptAsync } from "@noble/hashes/scrypt";
import { getRandomValues } from "uncrypto";
import { constantTimeEqual } from "./buffer";

const config = {
  N: 16384,
  r: 8,
  p: 1,
  dkLen: 32,
};

async function generateKey(password: string, salt: string) {
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    r: config.r,
    p: config.p,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2,
  });
}

export const hashPassword = async (password: string) => {
  const salt = bytesToHex(getRandomValues(new Uint8Array(16)));

  const key = await generateKey(password, salt);

  return `${salt}.${bytesToHex(key)}`;
};

export const verifyPassword = async (password: string, hash: string) => {
  const [salt, key] = hash.split(".");
  const target_key = await generateKey(password, salt);
  return constantTimeEqual(target_key, hexToBytes(key));
};
