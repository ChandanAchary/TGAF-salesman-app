import z from "zod";

export const CreateCampainSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  categoryId: z.string(),
  hierarchyItemId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number(),
  fileUrls: z.array(z.string()),
});

export type CreateCampainType = z.infer<typeof CreateCampainSchema>;

export const ApproveCamapinSchema = z.object({
  campainId: z.string(),
})

export type ApproveCampainType = z.infer<typeof ApproveCamapinSchema>;

export const CampainSettlementSchema = z.object({
  campainId: z.string(),
  amount: z.number().min(0),
  evidenceUrls: z.array(z.string().url("Invalid URL format")),
})

export type CampainSettleType = z.infer<typeof CampainSettlementSchema>;

export const ApproveSettlementSchema = z.object({
  settlementId: z.string(),
})

export type ApproveSettlementType = z.infer<typeof ApproveSettlementSchema>;

export const CampaignActivitySchema = z.object({
  campainId: z.string(),
  action: z.string().min(3, "Action must be at least 3 characters").max(200, "Action must be less than 200 characters"),
  evidenceUrls: z.array(z.string().url("Invalid URL format")).min(1, "At least one evidence image is required"),
});

export type CampaignActivityType = z.infer<typeof CampaignActivitySchema>;