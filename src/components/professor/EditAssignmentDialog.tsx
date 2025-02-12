"use client";

import { type TRPCClientErrorLike } from "@trpc/client";
import { Loader2, PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { type AppRouter } from "~/server/api/root";
import { api, type RouterOutputs } from "~/utils/api";

type Assignment = RouterOutputs["assignment"]["getAll"][number];

interface EditAssignmentDialogProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAssignmentDialog({
  assignment,
  isOpen,
  onOpenChange,
}: EditAssignmentDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [questions, setQuestions] = useState<Assignment["questions"]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Reset state when assignment changes or dialog closes
  useEffect(() => {
    if (assignment && isOpen) {
      setName(assignment.name);
      setSelectedCourseId(assignment.courseId);
      setQuestions(assignment.questions);
    } else if (!isOpen) {
      // Reset state when dialog closes
      setName("");
      setSelectedCourseId("");
      setQuestions([]);
      setIsEditing(false);
    }
  }, [assignment, isOpen]);

  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } =
    api.course.getAll.useQuery();
  const utils = api.useUtils();

  const editAssignment = api.assignment.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
      void utils.assignment.getAll.invalidate();
      onOpenChange(false);
      setIsEditing(false);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsEditing(false);
    },
  });

  const handleQuestionEdit = (id: string, newText: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, text: newText } : q)),
    );
  };

  const handleQuestionDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleAddQuestion = () => {
    if (!assignment) return;

    const newId = (questions.length + 1).toString();
    setQuestions([
      ...questions,
      {
        id: newId,
        text: "",
        assignmentId: assignment.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  };

  const handleUpdate = async () => {
    if (!assignment) return;

    if (!selectedCourseId) {
      toast({
        title: "Error",
        description: "Course ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);

    await editAssignment.mutateAsync({
      id: assignment.id,
      name,
      courseId: selectedCourseId,
      questions: questions.map((q) => ({ id: q.id, text: q.text })),
    });
  };

  // Don't render anything if there's no assignment
  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCourses ? (
                  <SelectItem value="loading" disabled>
                    Loading courses...
                  </SelectItem>
                ) : !courses || courses.length === 0 ? (
                  <div className="p-2 text-center">
                    <p className="text-sm text-gray-500">
                      No courses available
                    </p>
                  </div>
                ) : (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Assignment Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter assignment name"
              required
            />
          </div>
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="flex items-start space-x-2">
                <Textarea
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionEdit(question.id, e.target.value)
                  }
                  className="max-h-[100px] min-h-[50px] flex-grow resize-y"
                  placeholder="Write your question here..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1"
                  onClick={() => handleQuestionDelete(question.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAddQuestion}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
          <Button
            onClick={handleUpdate}
            className="w-full"
            disabled={editAssignment.isPending || isEditing}
          >
            {editAssignment.isPending || isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Assignment...
              </>
            ) : (
              "Update Assignment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
