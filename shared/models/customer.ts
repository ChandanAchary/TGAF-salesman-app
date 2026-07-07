import z from "zod";

export const UpdateCustomerImageSchema = z.object({
    customerId: z.string().min(1, "Customer id is required"),
    innerImageUrl: z.string().optional(),
    outerImageUrl: z.string().optional()
})

export type UpdateCustomerImageParams = z.infer<typeof UpdateCustomerImageSchema>