"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitPreferences } from "@/actions/preference-actions";
import { PREFERENCE_LABELS, PREFERENCE_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Week {
  id: string;
  weekNumber: number;
  startDate: string | Date;
  endDate: string | Date;
  isHoliday: boolean;
  holidayName: string | null;
}

const PREFERENCE_OPTIONS = ["PREFERRED", "AVAILABLE", "UNAVAILABLE"] as const;

export function PreferenceGrid({
  weeks,
  existingPreferences,
  readOnly,
  userRole,
}: {
  weeks: Week[];
  existingPreferences: Record<string, string>;
  readOnly: boolean;
  userRole: string;
}) {
  const [preferences, setPreferences] = useState<Record<string, string>>(existingPreferences);
  const [saving, setSaving] = useState(false);

  function togglePreference(weekId: string) {
    if (readOnly) return;

    const current = preferences[weekId];
    let next: string;

    if (!current || current === "AVAILABLE") {
      next = "PREFERRED";
    } else if (current === "PREFERRED") {
      next = "UNAVAILABLE";
    } else {
      next = "AVAILABLE";
    }

    setPreferences((prev) => ({ ...prev, [weekId]: next }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = Object.entries(preferences).map(([weekId, preference]) => ({
        weekId,
        preference,
      }));
      await submitPreferences(data);
      toast.success("Preferences saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save preferences");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {PREFERENCE_OPTIONS.map((opt) => (
            <Badge key={opt} variant="outline" className={PREFERENCE_COLORS[opt]}>
              {PREFERENCE_LABELS[opt]}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Click a week to cycle through preferences</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weeks.map((week) => {
          const pref = preferences[week.id] || "AVAILABLE";
          return (
            <Card
              key={week.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                readOnly && "cursor-default opacity-75",
                PREFERENCE_COLORS[pref] || ""
              )}
              onClick={() => togglePreference(week.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Week {week.weekNumber}</span>
                  <Badge variant="outline" className="text-xs">
                    {PREFERENCE_LABELS[pref]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(week.startDate), "MMM d")} -{" "}
                  {format(new Date(week.endDate), "MMM d")}
                </p>
                {week.isHoliday && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    {week.holidayName || "Holiday"}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!readOnly && (
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      )}

      {readOnly && (
        <p className="text-sm text-muted-foreground">
          The preference deadline has passed. Your preferences are locked.
        </p>
      )}
    </div>
  );
}
