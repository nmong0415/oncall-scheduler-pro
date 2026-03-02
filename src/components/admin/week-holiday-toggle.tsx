"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toggleWeekHoliday } from "@/actions/quarter-actions";
import { toast } from "sonner";

interface Props {
  weekId: string;
  isHoliday: boolean;
  holidayName: string | null;
}

export function WeekHolidayToggle({ weekId, isHoliday, holidayName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newHoliday = !isHoliday;
    let name: string | undefined;

    if (newHoliday) {
      name = prompt("Holiday name (e.g., Thanksgiving):") || undefined;
    }

    try {
      await toggleWeekHoliday(weekId, newHoliday, name);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
    setLoading(false);
  }

  if (isHoliday) {
    return (
      <Badge
        variant="destructive"
        className="cursor-pointer text-xs"
        onClick={toggle}
      >
        {holidayName || "Holiday"}
      </Badge>
    );
  }

  return (
    <button
      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
      onClick={toggle}
      disabled={loading}
    >
      Mark
    </button>
  );
}
