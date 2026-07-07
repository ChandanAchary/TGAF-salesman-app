import z from "zod";

export const StartSalesmanActivityLogSchema = z.object({
  activityId: z.string().min(1, "Activity id is required")
});

export type StartSalesmanActivityLogParams = z.infer<typeof StartSalesmanActivityLogSchema>;

export const CreateActivitySchema = z.object({
  name: z.string().min(1, "Activity name is required"),
  description: z.string().optional()
})

export type CreateActivityParams = z.infer<typeof CreateActivitySchema>;

export type CheckedTargets = {
  id: string;
  latitude: number;
  longitude: number;
  distance: number;
  name: string;
}[];

export const CreatePickStockSchema = z.object({
  distributorId: z.string().min(1, "Distributor id is required"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product id is required"),
    quantity: z.number().min(1, "Quantity must be at least 1")
  }))
})

export type CreatePickStockParams = z.infer<typeof CreatePickStockSchema>;

export const ApprovePickStockSchema = z.object({
  otp: z.string().min(1, "OTP is required")
})

export type ApprovePickStockParams = z.infer<typeof ApprovePickStockSchema>;

export const CreateReconciliationSchema = z.object({
  pickStockId: z.string().min(1, "Pick stock id is required"),
  paidAmount: z.number().min(0, "Paid amount cannot be negative"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product id is required"),
    quantity: z.number().min(0, "Quantity cannot be negative")
  }))
})

export type CreateReconciliationParams = z.infer<typeof CreateReconciliationSchema>;

export const ApproveReconciliationSchema = z.object({
  otp: z.string().min(1, "OTP is required")
})

export type ApproveReconciliationParams = z.infer<typeof ApproveReconciliationSchema>;