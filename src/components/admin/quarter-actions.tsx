"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Send, Archive } from "lucide-react";
import { updateQuarterStatus, deleteQuarter } from "@/actions/quarter-actions";
import { toast } from "sonner";

interface QuarterActionsProps {
  quarter: {
    id: string;
    status: string;
    name: string;
  };
}

export function QuarterActions({ quarter }: QuarterActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  async function handleDelete() {
    if (!confirm(`Delete ${quarter.name}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteQuarter(quarter.id);
      toast.success(`${quarter.name} deleted`);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/quarters/${quarter.id}`}>
        <Button variant="outline" size="sm">
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>
      </Link>
      {quarter.status === "DRAFT" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublish}
            disabled={loading}
          >
            <Send className="mr-1 h-3 w-3" />
            Publish
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </>
      )}
      {quarter.status === "PUBLISHED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          disabled={loading}
        >
          <Archive className="mr-1 h-3 w-3" />
          Archive
        </Button>
      )}
    </div>
  );
}
