import assert from 'assert';
import forge, { Hex } from 'node-forge';

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

/**
 * Converts a hexadecimal string to a base64 url encoded string
 */
export function hexToBase64Url(hex: Hex): string {
  return Buffer.from(hex, 'hex')
    .toString('base64')
    .replace(/\//g, '-')
    .replace(/\+/g, '_')
    .replace('=', '');
}
