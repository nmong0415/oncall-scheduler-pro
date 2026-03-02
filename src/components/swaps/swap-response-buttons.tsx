"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { respondToSwap } from "@/actions/swap-actions";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export function SwapResponseButtons({ swapId }: { swapId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleResponse(response: "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      await respondToSwap(swapId, response);
      toast.success(response === "APPROVED" ? "Swap approved" : "Swap rejected");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to respond");
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleResponse("APPROVED")}
        disabled={loading}
        className="h-7 text-green-600"
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleResponse("REJECTED")}
        disabled={loading}
        className="h-7 text-red-600"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
