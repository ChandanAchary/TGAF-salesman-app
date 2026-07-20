import z from "zod"

export const CreatePrimaryOrderReturnSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  reason: z.enum(["DAMAGED", "EXPIRED", "WRONG_ITEM", "OTHER", "SHORTAGE"])
})

export type CreatePrimaryOrderReturnInput = z.infer<typeof CreatePrimaryOrderReturnSchema>

export enum ReturnReason {
  DAMAGED = "DAMAGED",
  EXPIRED = "EXPIRED",
  WRONG_ITEM = "WRONG_ITEM",
  OTHER = "OTHER",
  SHORTAGE = "SHORTAGE"
}


export const VerifyDistributorOtpSchema = z.object({
  distributorId: z.string().min(1, "Distributor id is required"),
  otp: z.string().min(1, "OTP is required")
})

export type VerifyDistributorOtpParams = z.infer<typeof VerifyDistributorOtpSchema>
