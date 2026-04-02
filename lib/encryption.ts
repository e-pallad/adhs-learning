import crypto from "crypto"

/**
 * Encrypt sensitive data (e.g., API tokens) using AES-256-GCM.
 * Requires ENCRYPTION_KEY environment variable (32 bytes, hex-encoded).
 */
export function encryptToken(plaintext: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex")
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)")
  }

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()
  // Format: IV (32 hex) + authTag (32 hex) + ciphertext
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

/**
 * Decrypt AES-256-GCM encrypted token.
 * Returns empty string if decryption fails (graceful degradation).
 */
export function decryptToken(encrypted: string): string {
  try {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex")
    if (key.length !== 32) {
      console.error("ENCRYPTION_KEY misconfigured")
      return ""
    }

    const parts = encrypted.split(":")
    if (parts.length !== 3) {
      console.error("Invalid encrypted token format")
      return ""
    }

    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const ciphertext = parts[2]

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (err) {
    console.error("Token decryption failed:", err)
    return ""
  }
}
