import z from "zod";

export const UpdateCustomerImageSchema = z.object({
    customerId: z.string().min(1, "Customer id is required"),
    innerImageUrl: z.string().optional(),
    outerImageUrl: z.string().optional()
})

export type UpdateCustomerImageParams = z.infer<typeof UpdateCustomerImageSchema>

export const VerifyCustomerOtpSchema = z.object({
    customerId: z.string().min(1, "Customer id is required"),
    otp: z.string().min(1, "OTP is required")
})

export type VerifyCustomerOtpParams = z.infer<typeof VerifyCustomerOtpSchema>