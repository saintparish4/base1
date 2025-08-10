import request from "supertest";
import app from "../../../src/index";
import { MerchantModel } from "../../../src/models/merchant.model";

describe("Payments API", () => {
  let merchantApiKey: string;
  let merchantId: string;

  beforeEach(async () => {
    // CREATE TEST MERCHANT WITH UNIQUE EMAIL
    const uniqueEmail = `merchant-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const merchant = await MerchantModel.create({
      email: uniqueEmail,
      password: "TestPassword123!",
      businessName: "Test Business",
    });

    merchantId = merchant.id;
    merchantApiKey = merchant.apiKey!;
  });

  // Note: Database cleanup happens automatically between test runs

  describe("POST /api/payments", () => {
    const validPayment = {
      amount: 100,
      currency: "USDC",
      description: "Test Payment",
      customerEmail: "customer@test.com",
      expiresIn: 30,
    };

    it("should create a payment successfully", async () => {
      const response = await request(app)
        .post("/api/payments")
        .set("X-API-Key", merchantApiKey)
        .send(validPayment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment).toBeDefined();
      expect(response.body.data.payment.amount).toBe(validPayment.amount);
      expect(response.body.data.payment.paymentUrl).toBeDefined();
      expect(response.body.data.feeInfo).toBeDefined();
    });

    it("should reject request without API key", async () => {
      const response = await request(app)
        .post("/api/payments")
        .send(validPayment)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("API Key is required");
    });

    it("should validate payment amount", async () => {
      const response = await request(app)
        .post("/api/payments")
        .set("X-API-Key", merchantApiKey)
        .send({ ...validPayment, amount: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
    });

    it("should handle large payment amounts", async () => {
      const response = await request(app)
        .post("/api/payments")
        .set("X-API-Key", merchantApiKey)
        .send({ ...validPayment, amount: 1000000 })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/payments/:id", () => {
    let paymentId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/payments")
        .set("X-API-Key", merchantApiKey)
        .send({
          amount: 50,
          currency: "USDC",
          description: "Test Payment for GET",
        });
      paymentId = response.body.data.payment.id;
    });

    it("should get payment details", async () => {
      const response = await request(app)
        .get(`/api/payments/${paymentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment).toBeDefined();
      expect(response.body.data.payment.id).toBe(paymentId);
      expect(response.body.data.payment.amount).toBe(50);
    });

    it("should return 404 for non-existent payment", async () => {
      const fakeId = "123e4567-e89b-12d3-a456-426614174000";
      const response = await request(app)
        .get(`/api/payments/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Payment not found");
    });
  });
});
