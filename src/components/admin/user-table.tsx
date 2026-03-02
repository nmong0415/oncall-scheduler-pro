"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUser, toggleUserActive } from "@/actions/user-actions";
import { ROLE_LABELS, ROLE_COLORS, ROLES } from "@/lib/constants";
import { toast } from "sonner";
import { Shield, ShieldOff, UserX, UserCheck } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  isActive: boolean;
}

export function UserTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRoleChange(userId: string, role: string) {
    setLoading(userId);
    try {
      await updateUser(userId, { role });
      toast.success("Role updated");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    }
    setLoading(null);
  }

  async function handleToggleAdmin(userId: string, isAdmin: boolean) {
    setLoading(userId);
    try {
      await updateUser(userId, { isAdmin: !isAdmin });
      toast.success(isAdmin ? "Admin access revoked" : "Admin access granted");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
    setLoading(null);
  }

  async function handleToggleActive(userId: string) {
    setLoading(userId);
    try {
      await toggleUserActive(userId);
      toast.success("User status updated");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
    setLoading(null);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.name}</span>
                {user.isAdmin && (
                  <Badge variant="default" className="text-xs">Admin</Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
              <Select
                defaultValue={user.role}
                onValueChange={(v) => handleRoleChange(user.id, v)}
                disabled={loading === user.id}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                  disabled={loading === user.id}
                  title={user.isAdmin ? "Revoke admin" : "Grant admin"}
                >
                  {user.isAdmin ? (
                    <ShieldOff className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(user.id)}
                  disabled={loading === user.id}
                  title={user.isActive ? "Deactivate" : "Activate"}
                >
                  {user.isActive ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
