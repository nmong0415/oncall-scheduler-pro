export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { getDraftQuarter } from "@/actions/quarter-actions";
import { getUserPreferences } from "@/actions/preference-actions";
import { PreferenceGrid } from "@/components/preferences/preference-grid";

export default async function PreferencesPage() {
  const session = await auth();
  const quarter = await getDraftQuarter();

  if (!quarter) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Preferences</h2>
          <p className="text-muted-foreground">
            Set your availability for each week of the upcoming quarter.
          </p>
        </div>
        <p className="text-muted-foreground">
          No draft quarter available for preference submission. Check back when the admin creates a new quarter.
        </p>
      </div>
    );
  }

  const existingPrefs = await getUserPreferences(quarter.id);
  const prefMap: Record<string, string> = {};
  for (const p of existingPrefs) {
    prefMap[p.weekId] = p.preference;
  }

  // Check if deadline has passed
  const isPastDeadline =
    quarter.preferenceDeadline && new Date() > new Date(quarter.preferenceDeadline);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Preferences</h2>
        <p className="text-muted-foreground">
          Set your availability for {quarter.name}.
          {quarter.preferenceDeadline && (
            <> Deadline: {new Date(quarter.preferenceDeadline).toLocaleDateString()}</>
          )}
        </p>
      </div>

      <PreferenceGrid
        weeks={quarter.weeks}
        existingPreferences={prefMap}
        readOnly={!!isPastDeadline}
        userRole={session?.user?.role || ""}
      />
    </div>
  );
}
