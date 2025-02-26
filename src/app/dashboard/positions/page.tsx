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
import { api } from "~/trpc/react";
import { NewPositionDialog } from "./components/NewPositionDialog";

// Define the type for the position data returned from the API
interface Position {
  id: string;
  title: string;
  department: string;
  openings: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  created: string;
  questionCount: number;
}

export default function PositionsPage() {
  // Fetch positions from the API
  const { data: positions, isLoading } =
    api.positions.getPositions.useQuery<Position[]>();

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
                  <TableHead>Department</TableHead>
                  <TableHead>Openings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
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
                      <TableCell>{position.department}</TableCell>
                      <TableCell>{position.openings}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            position.status === "ACTIVE"
                              ? "bg-verbo-green/20 text-verbo-green"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {position.status}
                        </span>
                      </TableCell>
                      <TableCell>{position.created}</TableCell>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions?.filter((p: Position) => p.status === "ACTIVE")
                .length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions?.filter((p: Position) => p.status === "DRAFT")
                .length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Openings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions?.reduce(
                (sum: number, p: Position) => sum + p.openings,
                0,
              ) || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
