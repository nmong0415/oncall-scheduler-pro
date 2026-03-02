export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { getSwapRequests } from "@/actions/swap-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ROLE_LABELS, SWAP_STATUS_LABELS } from "@/lib/constants";
import { ArrowLeftRight } from "lucide-react";
import { SwapResponseButtons } from "@/components/swaps/swap-response-buttons";

export default async function SwapsPage() {
  const session = await auth();
  const swaps = await getSwapRequests();

  const myRequests = swaps.filter(
    (s) => s.fromUserId === session?.user?.dbId
  );
  const incoming = swaps.filter(
    (s) => s.toUserId === session?.user?.dbId
  );

  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING": return "secondary";
      case "APPROVED": return "default";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Swap Requests</h2>
        <p className="text-muted-foreground">
          Manage your shift swap requests.
        </p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">
            Incoming ({incoming.filter((s) => s.status === "PENDING").length})
          </TabsTrigger>
          <TabsTrigger value="my-requests">
            My Requests ({myRequests.length})
          </TabsTrigger>
          {session?.user?.isAdmin && (
            <TabsTrigger value="all">All ({swaps.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="incoming" className="space-y-3">
          {incoming.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No incoming swap requests.
              </CardContent>
            </Card>
          ) : (
            incoming.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {swap.fromUser.name} wants to swap Week{" "}
                        {swap.assignment.week.weekNumber} ({ROLE_LABELS[swap.assignment.role]})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(swap.assignment.week.startDate), "MMM d")} -{" "}
                        {format(new Date(swap.assignment.week.endDate), "MMM d")}
                        {swap.reason && ` - "${swap.reason}"`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(swap.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {SWAP_STATUS_LABELS[swap.status]}
                    </Badge>
                    {swap.status === "PENDING" && (
                      <SwapResponseButtons swapId={swap.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-3">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                You haven&apos;t made any swap requests.
              </CardContent>
            </Card>
          ) : (
            myRequests.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">
                      Week {swap.assignment.week.weekNumber} swap with{" "}
                      {swap.toUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(swap.assignment.week.startDate), "MMM d")} -{" "}
                      {format(new Date(swap.assignment.week.endDate), "MMM d")}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(swap.status) as "default" | "secondary" | "destructive" | "outline"}>
                    {SWAP_STATUS_LABELS[swap.status]}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {session?.user?.isAdmin && (
          <TabsContent value="all" className="space-y-3">
            {swaps.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {swap.fromUser.name} → {swap.toUser.name} | Week{" "}
                      {swap.assignment.week.weekNumber} ({ROLE_LABELS[swap.assignment.role]})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {swap.assignment.week.quarter.name} |{" "}
                      {format(new Date(swap.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(swap.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {SWAP_STATUS_LABELS[swap.status]}
                    </Badge>
                    {swap.status === "PENDING" && (
                      <SwapResponseButtons swapId={swap.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
