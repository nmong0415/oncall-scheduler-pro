"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wand2, CheckCheck, Send, Archive, Trash2 } from "lucide-react";
import { updateQuarterStatus } from "@/actions/quarter-actions";
import { runAutoScheduler, acceptAllSuggestions, clearAllAssignments } from "@/actions/scheduler-actions";
import { toast } from "sonner";

interface Props {
  quarter: {
    id: string;
    status: string;
    name: string;
  };
}

export function QuarterDetailActions({ quarter }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await runAutoScheduler(quarter.id);
      toast.success(
        `Generated ${result.assignmentsCreated} assignments. ${result.gaps.length} gaps found.`
      );
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate schedule");
    }
    setLoading(false);
  }

  async function handleConfirmAll() {
    setLoading(true);
    try {
      const result = await acceptAllSuggestions(quarter.id);
      toast.success(`Confirmed ${result.confirmed} assignments`);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm");
    }
    setLoading(false);
  }

  async function handleClearAll() {
    if (!confirm("Clear all assignments from this schedule? This cannot be undone.")) return;
    setLoading(true);
    try {
      await clearAllAssignments(quarter.id);
      toast.success("All assignments cleared");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to clear");
    }
    setLoading(false);
  }

  async function handlePublish() {
    setLoading(true);
    try {
      await updateQuarterStatus(quarter.id, "PUBLISHED");
      toast.success(`${quarter.name} published`);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to publish");
    }
    setLoading(false);
  }

  async function handleArchive() {
    setLoading(true);
    try {
      await updateQuarterStatus(quarter.id, "ARCHIVED");
      toast.success(`${quarter.name} archived`);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to archive");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {quarter.status === "DRAFT" && (
        <>
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={loading}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Auto-Generate
          </Button>
          <Button
            variant="outline"
            onClick={handleConfirmAll}
            disabled={loading}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Confirm All
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearAll}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button onClick={handlePublish} disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </>
      )}
      {quarter.status === "PUBLISHED" && (
        <Button variant="outline" onClick={handleArchive} disabled={loading}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
      )}
    </div>
  );
}
