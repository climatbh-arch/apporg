import crypto from "crypto";

/**
 * Hash password using PBKDF2 (no external dependencies)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");

  return computedHash === storedHash;
}

/**
 * Generate JWT token
 */
export function generateToken(userId: number, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, secret: string): { userId: number } | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    // Verify signature
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (computedSignature !== signature) return null;

    // Decode payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) return null;

    return { userId: decodedPayload.userId };
  } catch (error) {
    return null;
  }
}
