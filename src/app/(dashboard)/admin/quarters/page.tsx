export const dynamic = "force-dynamic";

import Link from "next/link";
import { getQuarters } from "@/actions/quarter-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Trash2, Send, Archive } from "lucide-react";
import { format } from "date-fns";
import { QUARTER_STATUS_LABELS } from "@/lib/constants";
import { QuarterActions } from "@/components/admin/quarter-actions";
import { ClearAllQuarters } from "@/components/admin/clear-all-quarters";

export default async function QuartersPage() {
  const quarters = await getQuarters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">On Call Schedule</h2>
          <p className="text-muted-foreground">
            Manage on-call scheduling periods.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quarters.length > 0 && <ClearAllQuarters />}
          <Link href="/admin/quarters/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quarter
            </Button>
          </Link>
        </div>
      </div>

      {quarters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No quarters created yet. Click &quot;New Quarter&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quarters.map((quarter) => {
            const assignedCount = quarter.weeks.reduce(
              (acc, w) => acc + w.assignments.length,
              0
            );
            const totalSlots = quarter.weeks.length * 4; // 4 roles per week
            const statusColor =
              quarter.status === "PUBLISHED"
                ? "default"
                : quarter.status === "DRAFT"
                ? "secondary"
                : "outline";

            return (
              <Card key={quarter.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{quarter.name}</CardTitle>
                    <Badge variant={statusColor}>
                      {QUARTER_STATUS_LABELS[quarter.status]}
                    </Badge>
                  </div>
                  <QuarterActions quarter={quarter} />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>
                      {format(new Date(quarter.startDate), "MMM d, yyyy")} -{" "}
                      {format(new Date(quarter.endDate), "MMM d, yyyy")}
                    </span>
                    <span>{quarter.weeks.length} weeks</span>
                    <span>
                      {assignedCount}/{totalSlots} slots filled
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
