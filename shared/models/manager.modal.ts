import z from 'zod';

export const CreateJointWorkingSchema = z.object({
  salesmanId: z.string().min(1, "Salesman ID is required"),
})

export type CreateJointWorkingParams = z.infer<typeof CreateJointWorkingSchema>;

export const EndJointWorkingSchema = CreateJointWorkingSchema;
export type EndJointWorkingParams = z.infer<typeof EndJointWorkingSchema>;
