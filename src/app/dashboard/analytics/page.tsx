"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="candidates">Candidate Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72/100</div>
                <p className="text-xs text-muted-foreground">
                  Across all challenges
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124h</div>
                <p className="text-xs text-muted-foreground">
                  Assessment time this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Assessment Trends</CardTitle>
                <CardDescription>
                  Number of assessments over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  Chart placeholder - Assessment trends over time
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Skills</CardTitle>
                <CardDescription>
                  Skills with highest average scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  Chart placeholder - Top skills by score
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Distribution</CardTitle>
              <CardDescription>
                Overview of assessed skills and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                Chart placeholder - Skills distribution and metrics
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Performance</CardTitle>
              <CardDescription>
                Individual candidate performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                Chart placeholder - Candidate performance metrics
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
