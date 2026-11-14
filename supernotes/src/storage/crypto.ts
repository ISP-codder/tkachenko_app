const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function makeSalt(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return toHex(buf.buffer);
}

/** PBKDF2-SHA256, 100k итераций → hex */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex),
      iterations: 100_000,
      hash: 'SHA-256',
    } as any,
    keyMaterial,
    256
  );
  return toHex(bits);
}

export async function verifyPassword(
  password: string,
  saltHex: string,
  expectedHex: string
): Promise<boolean> {
  const got = await hashPassword(password, saltHex);
  // константное сравнение по длине (для учебного достаточно)
  if (got.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) {
    diff |= got.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}