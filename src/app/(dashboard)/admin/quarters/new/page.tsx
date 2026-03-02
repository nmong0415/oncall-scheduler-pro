"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createQuarter } from "@/actions/quarter-actions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewQuarterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await createQuarter(formData);
      toast.success("Quarter created with 13 weeks");
      router.push(`/admin/quarters/${result.quarterId}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create quarter");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/quarters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Quarter</h2>
          <p className="text-muted-foreground">
            Create a new quarterly scheduling period. 13 weekly blocks (Mon-Sun) will be generated automatically.
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Quarter Details</CardTitle>
          <CardDescription>
            Set the name and start date for the new quarter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Quarter Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Q3 2026"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Monday)</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
              />
              <p className="text-xs text-muted-foreground">
                The schedule will start on the Monday of the selected week.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferenceDeadline">Preference Deadline (optional)</Label>
              <Input
                id="preferenceDeadline"
                name="preferenceDeadline"
                type="date"
              />
              <p className="text-xs text-muted-foreground">
                Users must submit their preferences before this date.
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Quarter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
