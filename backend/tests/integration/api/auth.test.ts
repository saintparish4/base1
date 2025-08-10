/// <reference types="jest" />
import request from "supertest";
import app from "../../../src/index";
import { MerchantModel } from "../../../src/models/merchant.model";

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    const validRegistration = {
      email: "test@example.com",
      password: "TestPassword123!",
      businessName: "Test Business",
      businessType: "online",
      contactPhone: "+1234567890",
    };

    it("should register merchant successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegistration)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.merchant).toBeDefined();
      expect(response.body.data.merchant.email).toBe(validRegistration.email);
    });

    it("should reject duplicate email", async () => {
      // FIRST REGISTRATION
      await request(app)
        .post("/api/auth/register")
        .send(validRegistration)
        .expect(201);

      // SECOND REGISTRATION WITH SAME EMAIL
      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegistration)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("already exists");
    });

    it("should validate email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validRegistration, email: "invalid-email" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
    });

    it("should validate password strength", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validRegistration, password: "weak" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("POST /api/auth/login", () => {
    const loginCredentials = {
      email: "test@example.com",
      password: "TestPassword123!",
    };

    beforeEach(async () => {
      // CREATE TEST MERCHANT
      await MerchantModel.create({
        email: loginCredentials.email,
        password: loginCredentials.password,
        businessName: "Test Business",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send(loginCredentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.merchant).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ ...loginCredentials, password: "wrong-password" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid email or password");
    });
  });
});
