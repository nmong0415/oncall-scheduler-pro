export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuarterById } from "@/actions/quarter-actions";
import { getUsers } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import { ArrowLeft, Wand2 } from "lucide-react";
import { ROLE_LABELS, ROLES, QUARTER_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS } from "@/lib/constants";
import { QuarterDetailActions } from "@/components/admin/quarter-detail-actions";
import { WeekHolidayToggle } from "@/components/admin/week-holiday-toggle";
import { AssignmentCell } from "@/components/admin/assignment-cell-admin";

interface PageProps {
  params: Promise<{ quarterId: string }>;
}

export default async function QuarterDetailPage({ params }: PageProps) {
  const { quarterId } = await params;
  const quarter = await getQuarterById(quarterId);
  if (!quarter) notFound();

  const users = await getUsers();

  const statusColor =
    quarter.status === "PUBLISHED"
      ? "default"
      : quarter.status === "DRAFT"
      ? "secondary"
      : "outline";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/quarters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {quarter.name}
              </h2>
              <Badge variant={statusColor}>
                {QUARTER_STATUS_LABELS[quarter.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {format(new Date(quarter.startDate), "MMM d, yyyy")} -{" "}
              {format(new Date(quarter.endDate), "MMM d, yyyy")} | {quarter.weeks.length} weeks
            </p>
          </div>
        </div>
        <QuarterDetailActions quarter={quarter} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Week</TableHead>
                  <TableHead className="w-[160px]">Dates</TableHead>
                  <TableHead className="w-[80px]">Holiday</TableHead>
                  {ROLES.map((role) => (
                    <TableHead key={role}>{ROLE_LABELS[role]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarter.weeks.map((week) => (
                  <TableRow key={week.id}>
                    <TableCell className="font-medium">
                      {week.weekNumber}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(week.startDate), "MMM d")} -{" "}
                      {format(new Date(week.endDate), "MMM d")}
                    </TableCell>
                    <TableCell>
                      <WeekHolidayToggle
                        weekId={week.id}
                        isHoliday={week.isHoliday}
                        holidayName={week.holidayName}
                      />
                    </TableCell>
                    {ROLES.map((role) => {
                      const assignment = week.assignments.find(
                        (a) => a.role === role
                      );
                      return (
                        <TableCell key={role}>
                          <AssignmentCell
                            weekId={week.id}
                            role={role}
                            assignment={assignment}
                            users={users.filter(
                              (u) => u.role === role && u.isActive
                            )}
                            isEditable={quarter.status === "DRAFT"}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
