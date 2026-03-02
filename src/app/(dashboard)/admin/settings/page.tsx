"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSettings, updateAppSettings } from "@/actions/settings-actions";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    preferenceDeadlineDays: 14,
    maxConsecutiveWeeks: 1,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAppSettings().then((s) => {
      if (s) {
        setSettings({
          preferenceDeadlineDays: s.preferenceDeadlineDays,
          maxConsecutiveWeeks: s.maxConsecutiveWeeks,
          notificationsEnabled: s.notificationsEnabled,
        });
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateAppSettings(formData);
      toast.success("Settings updated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update settings");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure application-wide scheduling settings.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Scheduling Configuration</CardTitle>
          <CardDescription>
            These settings affect how the auto-scheduler generates assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferenceDeadlineDays">
                Preference Deadline (days before quarter start)
              </Label>
              <Input
                id="preferenceDeadlineDays"
                name="preferenceDeadlineDays"
                type="number"
                min="1"
                max="60"
                value={settings.preferenceDeadlineDays}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    preferenceDeadlineDays: parseInt(e.target.value) || 14,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxConsecutiveWeeks">
                Max Consecutive Weeks (back-to-back prevention)
              </Label>
              <Input
                id="maxConsecutiveWeeks"
                name="maxConsecutiveWeeks"
                type="number"
                min="1"
                max="4"
                value={settings.maxConsecutiveWeeks}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    maxConsecutiveWeeks: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notificationsEnabled"
                name="notificationsEnabled"
                value="true"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    notificationsEnabled: e.target.checked,
                  }))
                }
              />
              <Label htmlFor="notificationsEnabled">Enable email notifications</Label>
            </div>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
