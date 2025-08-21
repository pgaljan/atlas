// src/utils/encryption.js
import CryptoJS from "crypto-js";

const SECRET_HEX = import.meta.env.VITE_APP_ENCRYPTION_SECRET || "";

function ensureKey() {
  if (!SECRET_HEX || SECRET_HEX.length !== 64) {
    throw new Error(
      "VITE_APP_ENCRYPTION_SECRET must be set and be a 64-character hex string"
    );
  }
  return CryptoJS.enc.Hex.parse(SECRET_HEX);
}


export function encryptPermission(plainText) {
  if (!plainText && plainText !== 0) return "";
  const key = ensureKey();
  const iv = CryptoJS.lib.WordArray.random(4); 
  const encrypted = CryptoJS.AES.encrypt(String(plainText), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const ivHex = CryptoJS.enc.Hex.stringify(iv);
  const cipherHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  return `${ivHex}:${cipherHex}`;
}


export function decryptPermission(token) {
  if (!token) return null;
  try {
    const decoded = decodeURIComponent(token);
    const [ivHex, cipherHex] = decoded.split(":");
    if (!ivHex || !cipherHex) return null;

    const key = ensureKey();
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    const decryptedBytes = CryptoJS.AES.decrypt(cipherHex, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const plain = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return plain || null;
  } catch (err) {
    console.error("decryptPermission error:", err);
    return null;
  }
}
