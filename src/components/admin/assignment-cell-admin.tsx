"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { createAssignment, removeAssignment, updateAssignmentStatus } from "@/actions/assignment-actions";
import { ASSIGNMENT_STATUS_COLORS, ASSIGNMENT_STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { UserPlus, X, Lock, Unlock } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  userId: string;
  role: string;
  status: string;
  user: User;
}

interface Props {
  weekId: string;
  role: string;
  assignment: Assignment | undefined;
  users: User[];
  isEditable: boolean;
}

export function AssignmentCell({
  weekId,
  role,
  assignment,
  users,
  isEditable,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await createAssignment(weekId, selectedUserId, role);
      toast.success("Assignment created");
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to assign");
    }
    setLoading(false);
  }

  async function handleRemove() {
    if (!assignment) return;
    setLoading(true);
    try {
      await removeAssignment(assignment.id);
      toast.success("Assignment removed");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    }
    setLoading(false);
  }

  async function handleToggleLock() {
    if (!assignment) return;
    setLoading(true);
    const newStatus = assignment.status === "LOCKED" ? "CONFIRMED" : "LOCKED";
    try {
      await updateAssignmentStatus(assignment.id, newStatus);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
    setLoading(false);
  }

  if (!assignment) {
    if (!isEditable) {
      return (
        <span className="text-xs text-red-500 font-medium">Unassigned</span>
      );
    }
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500">
            <UserPlus className="mr-1 h-3 w-3" />
            Assign
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {role}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} disabled={!selectedUserId || loading}>
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex-1">
        <span className="text-sm">{assignment.user.name}</span>
        <Badge
          variant="outline"
          className={`ml-1 text-[10px] ${ASSIGNMENT_STATUS_COLORS[assignment.status] || ""}`}
        >
          {ASSIGNMENT_STATUS_LABELS[assignment.status]}
        </Badge>
      </div>
      {isEditable && (
        <div className="flex gap-0.5">
          <button
            onClick={handleToggleLock}
            className="rounded p-1 hover:bg-accent"
            title={assignment.status === "LOCKED" ? "Unlock" : "Lock"}
            disabled={loading}
          >
            {assignment.status === "LOCKED" ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Unlock className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={handleRemove}
            className="rounded p-1 hover:bg-destructive/10"
            title="Remove"
            disabled={loading}
          >
            <X className="h-3 w-3 text-destructive" />
          </button>
        </div>
      )}
    </div>
  );
}
