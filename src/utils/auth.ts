// Password hashing using Web Crypto API (SHA-256 with salt)
// This runs in the browser using SubtleCrypto

async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  
  // Multiple iterations for security
  let hash = data;
  for (let i = 0; i < 10000; i++) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', hash);
    hash = new Uint8Array(hashBuffer);
  }
  
  return Array.from(hash, b => b.toString(16).padStart(2, '0')).join('');
}

export async function createPasswordHash(password: string): Promise<{ hash: string; salt: string }> {
  const salt = await generateSalt();
  const hash = await hashPassword(password, salt);
  return { hash, salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === hash;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be less than 128 characters';
  return null;
}

export function validatePin(pin: string): string | null {
  if (pin.length !== 4 && pin.length !== 6) return 'PIN must be 4 or 6 digits';
  if (!/^\d+$/.test(pin)) return 'PIN must contain only digits';
  return null;
}
