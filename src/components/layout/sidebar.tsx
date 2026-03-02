"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  CalendarCheck,
  ArrowLeftRight,
  Users,
  FolderCog,
  Settings,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const userLinks = [
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/preferences", label: "My Preferences", icon: ClipboardList },
  { href: "/my-shifts", label: "My Shifts", icon: CalendarCheck },
  { href: "/swaps", label: "Swap Requests", icon: ArrowLeftRight },
];

const adminLinks = [
  { href: "/admin/quarters", label: "Quarters", icon: FolderCog },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold">On-Call Scheduler</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
          Navigation
        </p>
        {userLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        {session?.user?.isAdmin && (
          <>
            <div className="my-4 border-t" />
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Administration
            </p>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {session?.user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {session.user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{session.user.name}</p>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {ROLE_LABELS[session.user.role] || session.user.role}
                </Badge>
                {session.user.isAdmin && (
                  <Badge variant="default" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
