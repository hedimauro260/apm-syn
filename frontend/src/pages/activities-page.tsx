import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ActivitiesPageHeader } from "./activities/activities-page-header";
import { ActivitiesScopeTabs } from "./activities/activities-scope-tabs";
import { ActivitiesSummary } from "./activities/activities-summary";
import { ActivitiesAnalysis } from "./activities/activities-analysis";
import { ActivitiesRecent } from "./activities/activities-recent";
import { ActivitiesHistory } from "./activities/activities-history";
import type { ActivitiesScope } from "./activities/activities-utils";

export function ActivitiesPage() {
  const [scope, setScope] = useState<ActivitiesScope>("all");

  return (
    <div>
      <Helmet>
        <title>Activities | APM Syn</title>
        <meta
          name="description"
          content="Daily activity history for your wallets, websites and transactions."
        />
      </Helmet>
      <div className="flex p-4 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <ActivitiesPageHeader />
            <ActivitiesScopeTabs value={scope} onChange={setScope} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActivitiesSummary scope={scope} />
            <ActivitiesAnalysis scope={scope} />
          </div>
        </div>
        <div className="flex-1">
          <ActivitiesRecent scope={scope} />
        </div>
      </div>
      <div className="p-4 w-full">
        <ActivitiesHistory scope={scope} />
      </div>
    </div>
  );
}