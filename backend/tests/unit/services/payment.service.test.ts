import { PaymentService } from "../../../src/services/payment/payment.service";
import { PaymentModel } from "../../../src/models/payment.model";
import { MerchantModel } from "../../../src/models/merchant.model";
import { CustomError } from "../../../src/middleware/error.middleware";

jest.mock("../../../src/models/payment.model");
jest.mock("../../../src/models/merchant.model");

describe("PaymentService", () => {
  let paymentService: PaymentService;
  let mockMerchantModel: jest.Mocked<typeof MerchantModel>;
  let mockPaymentModel: jest.Mocked<typeof PaymentModel>;

  beforeEach(() => {
    paymentService = new PaymentService();
    mockMerchantModel = MerchantModel as jest.Mocked<typeof MerchantModel>;
    mockPaymentModel = PaymentModel as jest.Mocked<typeof PaymentModel>;
    jest.clearAllMocks();
  });

  describe("createPayment", () => {
    const mockMerchant = {
      id: "merchant-123",
      email: "test@example.com",
      businessName: "Test Business",
      status: "active" as const,
      feeRate: 0.015,
      kycStatus: "approved" as const,
      settlementSchedule: "daily" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const paymentData = {
      amount: 100,
      currency: "USDC",
      description: "Test payment",
      customerEmail: "customer@example.com",
    };

    it("should create payment successfully", async () => {
      mockMerchantModel.findById.mockResolvedValue(mockMerchant);
      mockPaymentModel.create.mockResolvedValue({
        id: "payment-123",
        merchantId: "merchant-123",
        status: "pending",
        paymentUrl: "https://base.pay.com/pay/payment-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...paymentData,
      });

      const result = await paymentService.createPayment(
        "merchant-123",
        paymentData
      );

      expect(result).toBeDefined();
      expect(result.amount).toBe(100);
      expect(result.status).toBe("pending");
      expect(mockMerchantModel.findById).toHaveBeenCalledWith("merchant-123");
      expect(mockPaymentModel.create).toHaveBeenCalledWith(
        "merchant-123",
        paymentData
      );
    });

    it("should throw error if merchant not found", async () => {
      mockMerchantModel.findById.mockResolvedValue(null);

      await expect(
        paymentService.createPayment("invalid-merchant", paymentData)
      ).rejects.toThrow(CustomError);
    });

    it("should throw error if merchant not active", async () => {
      mockMerchantModel.findById.mockResolvedValue({
        ...mockMerchant,
        status: "suspended",
      });

      await expect(
        paymentService.createPayment("merchant-123", paymentData)
      ).rejects.toThrow("Merchant account is not active");
    });

    it("should throw error for invalid amount", async () => {
      mockMerchantModel.findById.mockResolvedValue(mockMerchant);

      await expect(
        paymentService.createPayment("merchant-123", {
          ...paymentData,
          amount: -10,
        })
      ).rejects.toThrow("Invalid payment amount");
    });
  });
});
