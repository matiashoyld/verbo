"use client";

import {
  Briefcase,
  ExternalLink,
  Link,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import { ViewPositionDialog } from "./components/ViewPositionDialog";

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
  const {
    data: positions,
    isLoading,
    refetch,
  } = api.positions.getPositions.useQuery();

  // State for controlling the dialogs
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for tracking the selected position
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null,
  );
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(
    null,
  );

  // TRPC mutation for deleting a position
  const deletePositionMutation = api.positions.deletePosition.useMutation({
    onSuccess: () => {
      toast.success("Position deleted", {
        description: "The position and all associated data have been removed.",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Error deleting position", {
        description: error.message,
      });
    },
  });

  // Function to handle position deletion
  const handleDeletePosition = () => {
    if (positionToDelete) {
      deletePositionMutation.mutate({ id: positionToDelete.id });
      setDeleteDialogOpen(false);
      setPositionToDelete(null);
    }
  };

  // Function to copy position link to clipboard
  const copyPositionLink = (position: Position) => {
    const link = `${window.location.origin}/recruiter/positions/${position.id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copied", {
        description: "Position link copied to clipboard.",
      });
    });
  };

  // Function to handle view position
  const handleViewPosition = (position: Position) => {
    setSelectedPositionId(position.id);
    setViewDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Positions</h2>
        <Button
          className="bg-verbo-purple hover:bg-verbo-purple/90"
          onClick={() => setNewDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Position
        </Button>
      </div>

      {/* New Position Dialog */}
      <NewPositionDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />

      {/* View Position Dialog */}
      <ViewPositionDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        positionId={selectedPositionId}
      />

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
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center gap-2 text-sm"
                              onClick={() => handleViewPosition(position)}
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center gap-2 text-sm"
                              onClick={() => copyPositionLink(position)}
                            >
                              <Link className="h-4 w-4" />
                              <span>Copy link</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center gap-2 text-sm text-destructive focus:text-destructive"
                              onClick={() => {
                                setPositionToDelete(position);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              Are you absolutely sure?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This will permanently delete the position "
              {positionToDelete?.title}" and all associated questions and
              competencies. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePosition}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
