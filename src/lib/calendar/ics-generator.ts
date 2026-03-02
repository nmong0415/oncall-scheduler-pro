import ical, { ICalCalendarMethod } from "ical-generator";

interface ShiftEvent {
  weekNumber: number;
  role: string;
  quarterName: string;
  startDate: Date;
  endDate: Date;
}

export function generateICSFeed(
  userName: string,
  events: ShiftEvent[]
): string {
  const calendar = ical({
    name: `On-Call Schedule - ${userName}`,
    method: ICalCalendarMethod.PUBLISH,
    prodId: {
      company: "On-Call Scheduler Pro",
      product: "Schedule",
    },
  });

  for (const event of events) {
    calendar.createEvent({
      start: event.startDate,
      end: event.endDate,
      allDay: true,
      summary: `On-Call: ${event.role} (Week ${event.weekNumber})`,
      description: `${event.quarterName} - Week ${event.weekNumber}\nRole: ${event.role}`,
      categories: [{ name: "On-Call" }],
    });
  }

  return calendar.toString();
}
