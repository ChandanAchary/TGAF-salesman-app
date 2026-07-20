import z from "zod";

export const ApproveReceiveInvoiceSchema = z.object({
  invoiceId: z.string(),
  receivedItems: z.array(z.object({
    productId: z.string(),
    receivedQuantity: z.number().min(1),
    isMarkedForSettlement: z.boolean().optional().default(false),
  })),
})

export type ApproveReceiveInvoiceType = z.infer<typeof ApproveReceiveInvoiceSchema>;
