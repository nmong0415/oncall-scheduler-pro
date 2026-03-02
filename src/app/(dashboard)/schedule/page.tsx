export const dynamic = "force-dynamic";

import { getPublishedQuarter } from "@/actions/quarter-actions";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isWithinInterval } from "date-fns";
import { ROLE_LABELS, ROLES, ROLE_COLORS, ASSIGNMENT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Calendar, AlertTriangle } from "lucide-react";

export default async function SchedulePage() {
  const session = await auth();
  const quarter = await getPublishedQuarter();

  if (!quarter) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
          <p className="text-muted-foreground">
            View the current on-call rotation schedule.
          </p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No published schedule yet.
            {session?.user?.isAdmin && " Go to Administration > Quarters to create one."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const currentWeek = quarter.weeks.find((w) =>
    isWithinInterval(now, {
      start: new Date(w.startDate),
      end: new Date(w.endDate),
    })
  );

  // Find if the current user is on call this week
  const myCurrentShift = currentWeek?.assignments.find(
    (a) => a.userId === session?.user?.dbId
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
        <p className="text-muted-foreground">
          {quarter.name} | {format(new Date(quarter.startDate), "MMM d, yyyy")} -{" "}
          {format(new Date(quarter.endDate), "MMM d, yyyy")}
        </p>
      </div>

      {myCurrentShift && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-primary">
                You are on call this week as {ROLE_LABELS[myCurrentShift.role]}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentWeek && format(new Date(currentWeek.startDate), "MMM d")} -{" "}
                {currentWeek && format(new Date(currentWeek.endDate), "MMM d, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Full Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Week</TableHead>
                  <TableHead className="w-[160px]">Dates</TableHead>
                  {ROLES.map((role) => (
                    <TableHead key={role}>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs",
                          session?.user?.role === role && "bg-primary/10 text-primary font-bold"
                        )}
                      >
                        {ROLE_LABELS[role]}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarter.weeks.map((week) => {
                  const isCurrentWeek = currentWeek?.id === week.id;
                  return (
                    <TableRow
                      key={week.id}
                      className={cn(isCurrentWeek && "bg-primary/5 font-medium")}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {week.weekNumber}
                          {isCurrentWeek && (
                            <Badge variant="default" className="text-[10px] px-1">Now</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(week.startDate), "MMM d")} -{" "}
                        {format(new Date(week.endDate), "MMM d")}
                        {week.isHoliday && (
                          <Badge variant="destructive" className="ml-1 text-[10px]">
                            {week.holidayName || "Holiday"}
                          </Badge>
                        )}
                      </TableCell>
                      {ROLES.map((role) => {
                        const assignment = week.assignments.find(
                          (a) => a.role === role
                        );
                        const isMe = assignment?.userId === session?.user?.dbId;
                        return (
                          <TableCell
                            key={role}
                            className={cn(isMe && "bg-primary/10")}
                          >
                            {assignment ? (
                              <span className={cn("text-sm", isMe && "font-bold text-primary")}>
                                {assignment.user.name}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-red-500">
                                <AlertTriangle className="h-3 w-3" />
                                Gap
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
