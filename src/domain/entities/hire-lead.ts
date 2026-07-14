import type { HireRequest } from "@/domain/entities/hire-request";
import type { HireLeadStatus } from "@/domain/enums/hire-lead-status";

export interface HireLead {
  id: string;
  hireRequestId: string;
  photographerId: string;
  status: HireLeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface HireLeadWithRequest extends HireLead {
  request: HireRequest;
}

export interface HireLeadPhotographerSummary {
  id: string;
  displayName: string;
  phone: string | null;
  email: string | null;
  isVerified: boolean;
  coverageProvinces: string[];
  availableForHire: boolean;
  alreadyNotified: boolean;
  leadStatus: HireLeadStatus | null;
}
