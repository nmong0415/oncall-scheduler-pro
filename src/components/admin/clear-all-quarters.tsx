"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteAllQuarters } from "@/actions/quarter-actions";
import { toast } from "sonner";

export function ClearAllQuarters() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClearAll() {
    if (!confirm("Delete ALL schedules? This cannot be undone.")) return;
    setLoading(true);
    try {
      await deleteAllQuarters();
      toast.success("All schedules cleared");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to clear");
    }
    setLoading(false);
  }

  return (
    <Button
      variant="destructive"
      onClick={handleClearAll}
      disabled={loading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? "Clearing..." : "Clear All"}
    </Button>
  );
}
