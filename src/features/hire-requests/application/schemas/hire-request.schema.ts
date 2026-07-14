import { z } from "zod";
import { argentinaProvinceValues } from "@/domain/enums/argentina-province";
import { HireRequestStatus } from "@/domain/enums/hire-request-status";
import { HireLeadStatus } from "@/domain/enums/hire-lead-status";

export const createHireRequestSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  email: z.string().email("Email inválido").max(120),
  phone: z.string().max(40).optional(),
  province: z.enum(argentinaProvinceValues),
  city: z.string().max(100).optional(),
  eventType: z.string().min(2, "Contanos qué tipo de evento es").max(120),
  eventDate: z.string().optional(),
  message: z.string().min(10, "Mínimo 10 caracteres").max(1000),
});

export type CreateHireRequestInput = z.infer<typeof createHireRequestSchema>;

export const updateHireRequestStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    HireRequestStatus.PENDING,
    HireRequestStatus.CONTACTED,
    HireRequestStatus.CLOSED,
  ]),
});

export type UpdateHireRequestStatusInput = z.infer<
  typeof updateHireRequestStatusSchema
>;

export const notifyHirePhotographersSchema = z.object({
  hireRequestId: z.string().uuid(),
  photographerIds: z.array(z.string().min(1)).min(1, "Elegí al menos un fotografx"),
});

export type NotifyHirePhotographersInput = z.infer<
  typeof notifyHirePhotographersSchema
>;

export const updateHireLeadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum([
    HireLeadStatus.NOTIFIED,
    HireLeadStatus.INTERESTED,
    HireLeadStatus.PASSED,
  ]),
});

export type UpdateHireLeadStatusInput = z.infer<typeof updateHireLeadStatusSchema>;
