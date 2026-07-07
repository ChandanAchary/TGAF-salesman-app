import z from 'zod';

const SchemeTypeEnum = z.enum(['DISCOUNT', 'BONUS']);
export type SchemeType = z.infer<typeof SchemeTypeEnum>;

const OrderTypeEnum = z.enum(['PRIMARY', 'SECONDARY']);

export type OrderType = z.infer<typeof OrderTypeEnum>;

export const SchemeModel = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  startDate: z.string(),
  endDate: z.string(),
  type: SchemeTypeEnum,
  buyQuantity: z.number().min(1),
  getQuantity: z.number().min(1),
  productId: z.string(),
  orderType: OrderTypeEnum,
});

export type Scheme = z.infer<typeof SchemeModel>;