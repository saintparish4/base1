import request from "supertest";
import app from "../../src/index";
import { MerchantModel } from "../../src/models/merchant.model";

describe("Payment Creation Load Test", () => {
  let merchantApiKey: string;
  let merchantId: string;

  beforeAll(async () => {
    const uniqueEmail = `load-test-${Date.now()}@example.com`;
    const merchant = await MerchantModel.create({
      email: uniqueEmail,
      password: "TestPassword123!",
      businessName: "Load Test Business",
    });

    merchantId = merchant.id;
    merchantApiKey = merchant.apiKey!;
  });

  // Note: Database cleanup happens automatically between test runs

  it("should handle 100 concurrent payment requests", async () => {
    const concurrentRequests = 100;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const promise = request(app)
        .post("/api/payments")
        .set("x-api-key", merchantApiKey)
        .send({
          amount: Math.floor(Math.random() * 1000) + 1,
          currency: "USDC",
          description: `Load test payment ${i}`,
          externalId: `load-test-${i}`,
        });

      promises.push(promise);
    }

    const results = await Promise.allSettled(promises);

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.status === 201
    ).length;

    const failed = results.length - successful;

    console.log(
      `Load test results: ${successful} successful, ${failed} failed`
    );

    // Expecting at least 95% success rate
    expect(successful / concurrentRequests).toBeGreaterThan(0.95);
  }, 30000);
});
