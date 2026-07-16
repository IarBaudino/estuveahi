import { ValidationError } from "@/domain/errors/domain-errors";
import {
  EVENT_SAME_DAY_PUBLISH_EMPTY,
  EVENT_SAME_DAY_RULE,
  isEventDateTodayOrYesterday,
} from "@/shared/lib/event-same-day";

export function assertEventDateIsToday(eventDate: string | Date): void {
  if (!isEventDateTodayOrYesterday(eventDate)) {
    throw new ValidationError(EVENT_SAME_DAY_RULE);
  }
}

export function assertCanPublishEvent(input: {
  eventDate: string | Date;
  photoCount: number;
}): void {
  if (input.photoCount > 0) return;
  if (!isEventDateTodayOrYesterday(input.eventDate)) {
    throw new ValidationError(EVENT_SAME_DAY_PUBLISH_EMPTY);
  }
}
