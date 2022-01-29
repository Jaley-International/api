import assert from 'assert';
import forge, { Hex } from 'node-forge';

// TODO : Change instance ID to be unique for each instance
export const INSTANCE_ID = 'PEC-4Kua7tTa5XAb';
export const SERVER_RANDOM_VALUE = 'd478b7b1ed80bbeed2401218c68137d1';

/**
 * Adds padding to a string to prevent timing attacks
 * @param {string}      str             Original string.
 * @param {number}      length          Desired length of the final string.
 * @return {string}
 */
export function addPadding(str: string, length: number): string {
  assert(str.length <= length);
  while (str.length < length) str += '_';
  return str;
}

/**
 * Hash using SHA256 the input string
 * @param {string}      str             String to be hashed.
 * @return {string}
 */
export function sha256(str: string): Hex {
  return forge.md.sha256.create().update(str).digest().toHex();
}

/**
 * Hash using SHA256 the input string
 * @param {string}      str             String to be hashed.
 * @return {string}
 */
export function sha512(str: string): Hex {
  return forge.md.sha512.create().update(str).digest().toHex();
}

export function generateSessionIdentifier(): Hex {
  return forge.util.bytesToHex(forge.random.getBytesSync(32));
}

export function rsaPublicEncrypt(key: string, value: Hex): Hex {
  const publicKey = forge.pki.publicKeyFromPem(key);
  return forge.util.bytesToHex(publicKey.encrypt(forge.util.hexToBytes(value)));
}
