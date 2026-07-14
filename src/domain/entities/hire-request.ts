import type { ArgentinaProvince } from "@/domain/enums/argentina-province";
import type { HireRequestStatus } from "@/domain/enums/hire-request-status";

export interface HireRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  province: ArgentinaProvince;
  city: string | null;
  eventType: string;
  eventDate: string | null;
  message: string;
  status: HireRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}
