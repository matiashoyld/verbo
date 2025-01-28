import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { api } from "~/trpc/react"
import { useToast } from "~/hooks/use-toast"

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false)
  const [courseName, setCourseName] = useState("")
  const { toast } = useToast()
  const utils = api.useUtils()

  const mutation = api.course.create.useMutation({
    onSuccess: () => {
      setOpen(false)
      setCourseName("")
      void utils.course.getAll.invalidate()
      toast({
        title: "Success",
        description: "Course created successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Course</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
          <DialogDescription>
            Create a new course. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutation.mutate({ name: courseName })}
            disabled={!courseName.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
