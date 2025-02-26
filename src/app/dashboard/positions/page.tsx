"use client";

import { Briefcase, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/trpc/react";
import { NewPositionDialog } from "./components/NewPositionDialog";

// Define the type for the position data returned from the API
interface Position {
  id: string;
  title: string;
  created: string;
  createdAt: string;
  questionCount: number;
}

export default function PositionsPage() {
  // Fetch positions from the API
  const { data: positions, isLoading } = api.positions.getPositions.useQuery();

  // State for controlling the dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Positions</h2>
        <Button
          className="bg-verbo-purple hover:bg-verbo-purple/90"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Position
        </Button>
      </div>

      {/* New Position Dialog */}
      <NewPositionDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-muted-foreground">Loading positions...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions && positions.length > 0 ? (
                  positions.map((position: Position) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4 text-verbo-dark" />
                          {position.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-default">
                              {position.created}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Created:{" "}
                                {new Date(position.createdAt).toLocaleString()}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{position.questionCount}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="text-muted-foreground">
                        No positions found. Create your first position to get
                        started.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions?.filter(
                (p: Position) =>
                  p.created.includes("minute") ||
                  p.created.includes("hour") ||
                  p.created === "today",
              ).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions?.reduce(
                (sum: number, p: Position) => sum + p.questionCount,
                0,
              ) || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
