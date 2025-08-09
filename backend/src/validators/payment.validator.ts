import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('USD', 'BTC', 'ETH').required(),
  recipientAddress: Joi.string().required(),
  description: Joi.string().max(500).optional(),
  webhookUrl: Joi.string().uri().optional(),
});

export const updatePaymentSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'failed', 'cancelled').required(),
  transactionHash: Joi.string().optional(),
});

export const webhookSchema = Joi.object({
  paymentId: Joi.string().uuid().required(),
  status: Joi.string().required(),
  transactionHash: Joi.string().optional(),
  confirmations: Joi.number().min(0).optional(),
});
