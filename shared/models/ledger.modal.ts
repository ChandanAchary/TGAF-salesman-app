import z from "zod";

export const UpsertLedgerSchema = z.object({
  distributorId: z.string(),
  balance: z.number().optional().default(0),
})

export type UpsertLedgerInput = z.infer<typeof UpsertLedgerSchema>;
