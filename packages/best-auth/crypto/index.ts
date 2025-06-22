import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/ciphers/utils";
import { managedNonce } from "@noble/ciphers/webcrypto";
import { createHash } from "./create-hash";

export type SymmetricEncryptionAlgOptions = {
  key: string;
  data: string;
};

export const encrypt_symmetrically = async ({
  key,
  data,
}: SymmetricEncryptionAlgOptions) => {
  const key_bytes = await createHash("SHA-256").digest(key);
  const data_as_bytes = utf8ToBytes(data);
  const chacha = managedNonce(xchacha20poly1305)(new Uint8Array(key_bytes));
  return bytesToHex(chacha.encrypt(data_as_bytes));
};
