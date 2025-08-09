import {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  createHmacSignature,
  verifyHmacSignature,
} from "../../../src/utils/crypto";

describe("Crypto Utils", () => {
  describe("encryption/decryption", () => {
    const key = Buffer.from("a".repeat(64), "hex");
    const plaintext = "Hello, World!";

    it("should encrypt and decrypt text correctly", () => {
      const encrypted = encrypt(plaintext, key);

      expect(encrypted).toHaveProperty("encrypted");
      expect(encrypted).toHaveProperty("iv");
      expect(encrypted).toHaveProperty("tag");

      const decrypted = decrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });

    it("should produce different ciphertext for same plaintext", () => {
      const encrypted1 = encrypt(plaintext, key);
      const encrypted2 = encrypt(plaintext, key);

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });

  describe("password hashing", () => {
    const password = "TestPassword123!";

    it("should hash password correctly", () => {
      const { hash, salt } = hashPassword(password);

      expect(hash).toBeDefined();
      expect(salt).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
      expect(salt.length).toBeGreaterThan(0);
    });

    it("should verify password correctly", () => {
      const { hash, salt } = hashPassword(password);

      expect(verifyPassword(password, hash, salt)).toBe(true);
      expect(verifyPassword("wrongpassword", hash, salt)).toBe(false);
    });

    it("should produce different hash/salt for same password", () => {
      const result1 = hashPassword(password);
      const result2 = hashPassword(password);

      expect(result1.hash).not.toBe(result2.hash);
      expect(result1.salt).not.toBe(result2.salt);
    });
  });

  describe("HMAC signatures", () => {
    const data = "test data";
    const secret = "secret key";

    it("should create and verify HMAC signature", () => {
      const signature = createHmacSignature(data, secret);

      expect(signature).toBeDefined();
      expect(signature.length).toBeGreaterThan(0);
      expect(verifyHmacSignature(data, signature, secret)).toBe(true);
    });

    it("should reject invalid signature", () => {
      const signature = createHmacSignature(data, secret);

      expect(verifyHmacSignature(data, "invalid", secret)).toBe(false);
      expect(verifyHmacSignature("wrong data", signature, secret)).toBe(false);
      expect(verifyHmacSignature(data, signature, "wrong secret")).toBe(false);
    });
  });

  describe("secure token generation", () => {
    it("should generate token of correct length", () => {
      const token = generateSecureToken(32);

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it("should generate different tokens", () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
    });
  });
});
