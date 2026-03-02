export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { getMyAssignments } from "@/actions/assignment-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { ROLE_LABELS, ROLE_COLORS, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS } from "@/lib/constants";
import { CalendarCheck } from "lucide-react";
import { SwapButton } from "@/components/swaps/swap-button";

export default async function MyShiftsPage() {
  const session = await auth();
  const assignments = await getMyAssignments();

  const upcoming = assignments.filter(
    (a) => !isPast(new Date(a.week.endDate))
  );
  const past = assignments.filter((a) => isPast(new Date(a.week.endDate)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Shifts</h2>
        <p className="text-muted-foreground">
          View your assigned on-call shifts.
        </p>
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <CalendarCheck className="mx-auto mb-2 h-8 w-8" />
            No shifts assigned yet.
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Upcoming</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge className={ROLE_COLORS[assignment.role]}>
                      {ROLE_LABELS[assignment.role]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={ASSIGNMENT_STATUS_COLORS[assignment.status]}
                    >
                      {ASSIGNMENT_STATUS_LABELS[assignment.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    Week {assignment.week.weekNumber} - {assignment.week.quarter.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(assignment.week.startDate), "MMM d")} -{" "}
                    {format(new Date(assignment.week.endDate), "MMM d, yyyy")}
                  </p>
                  {assignment.status !== "LOCKED" && (
                    <div className="mt-3">
                      <SwapButton
                        assignmentId={assignment.id}
                        role={assignment.role}
                        weekNumber={assignment.week.weekNumber}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-muted-foreground">Past</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((assignment) => (
              <Card key={assignment.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{ROLE_LABELS[assignment.role]}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    Week {assignment.week.weekNumber} - {assignment.week.quarter.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(assignment.week.startDate), "MMM d")} -{" "}
                    {format(new Date(assignment.week.endDate), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
