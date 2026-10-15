import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export async function createPasswordHash(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = Array.from(saltBytes, b => b.toString(16).padStart(2, '0')).join('');
  
  let data = password + salt;
  for (let i = 0; i < 1000; i++) {
    data = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
  }
  
  return { hash: data, salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  let data = password + salt;
  for (let i = 0; i < 1000; i++) {
    data = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
  }
  return data === hash;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validatePin(pin: string): string | null {
  if (pin.length !== 4 && pin.length !== 6) return 'PIN must be 4 or 6 digits';
  if (!/^\d+$/.test(pin)) return 'PIN must contain only digits';
  return null;
}
