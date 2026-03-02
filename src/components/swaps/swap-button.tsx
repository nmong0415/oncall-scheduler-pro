"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getUsersByRole } from "@/actions/user-actions";
import { createSwapRequest } from "@/actions/swap-actions";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  assignmentId: string;
  role: string;
  weekNumber: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function SwapButton({ assignmentId, role, weekNumber }: Props) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getUsersByRole(role).then(setUsers);
    }
  }, [open, role]);

  async function handleSubmit() {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await createSwapRequest(assignmentId, selectedUser, reason || undefined);
      toast.success("Swap request sent");
      setOpen(false);
      setSelectedUser("");
      setReason("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create swap request");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <ArrowLeftRight className="mr-2 h-3 w-3" />
          Request Swap
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Swap for Week {weekNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Swap with</Label>
            <Select onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need this swap?"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUser || loading}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Swap Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
