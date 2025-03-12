"use client";

import { SubmissionList } from "./components/SubmissionList";
import { SubmissionStats } from "./components/SubmissionStats";

export default function SubmissionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
      </div>

      <SubmissionStats />
      <SubmissionList />
    </div>
  );
}
