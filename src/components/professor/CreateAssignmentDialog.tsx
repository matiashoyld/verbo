"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Loader2, X, Upload, File } from "lucide-react"
import { PlusCircle } from "lucide-react"
import { api } from "~/utils/api"
import { useToast } from "~/hooks/use-toast"
import { useParams } from "next/navigation"
import { type TRPCClientErrorLike } from "@trpc/client"
import { type AppRouter } from "~/server/api/root"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"

type Question = {
  id: string
  text: string
}

export function CreateAssignmentDialog() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = api.course.getAll.useQuery()
  const utils = api.useUtils()

  const generateQuestions = api.assignment.generateQuestions.useMutation({
    onSuccess: (data: Question[]) => {
      setQuestions(data)
      setIsProcessing(false)
      setStep(2)
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setIsProcessing(false)
    },
  })

  const createAssignment = api.assignment.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment created successfully",
      })
      // Invalidate the assignments query to trigger a refetch
      void utils.assignment.getAll.invalidate()
      setIsOpen(false)
      setStep(1)
      setName("")
      setSelectedCourseId("")
      setFiles([])
      setQuestions([])
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourseId) {
      toast({
        title: "Error",
        description: "Please select a course",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const file = files[0] // For now, just handle the first file
      if (!file) {
        toast({
          title: "Error",
          description: "Please select a file",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (!reader.result) {
            reject(new Error("Failed to read file"))
            return
          }
          if (typeof reader.result !== "string") {
            reject(new Error("Invalid file content"))
            return
          }
          const base64Content = reader.result.split(",")[1]
          if (!base64Content) {
            reject(new Error("Invalid base64 content"))
            return
          }
          resolve(base64Content)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      await generateQuestions.mutateAsync({
        content: fileContent,
        mimeType: file.type,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process files",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleCreate = async () => {
    if (!selectedCourseId) {
      toast({
        title: "Error",
        description: "Course ID is required",
        variant: "destructive",
      })
      return
    }

    const file = files[0] // For now, just handle the first file
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      })
      return
    }

    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (!reader.result) {
          reject(new Error("Failed to read file"))
          return
        }
        if (typeof reader.result !== "string") {
          reject(new Error("Invalid file content"))
          return
        }
        const base64Content = reader.result.split(",")[1]
        if (!base64Content) {
          reject(new Error("Invalid base64 content"))
          return
        }
        resolve(base64Content)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    await createAssignment.mutateAsync({
      name,
      courseId: selectedCourseId,
      content: fileContent,
      questions,
    })
  }

  const handleQuestionEdit = (id: string, newText: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text: newText } : q)))
  }

  const handleQuestionDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleAddQuestion = () => {
    const newId = (questions.length + 1).toString()
    setQuestions([
      ...questions,
      {
        id: newId,
        text: "",
      },
    ])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Create New Assignment" : "Review Generated Questions"}</DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                      <p className="text-sm text-gray-500">No courses available</p>
                      <p className="text-xs text-gray-400 mt-1">Please create a course first before creating assignments</p>
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
            <div className="space-y-2">
              <Label htmlFor="files">Upload Files</Label>
              {files.length === 0 ? (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input
                    id="files"
                    type="file"
                    onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    required
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, TXT up to 10MB each</p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-blue-500" />
                        <span>{file.name}</span>
                        <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter((_, i) => i !== index))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isProcessing || !selectedCourseId}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </form>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="flex items-start space-x-2">
                  <Textarea
                    value={question.text}
                    onChange={(e) => handleQuestionEdit(question.id, e.target.value)}
                    className="flex-grow min-h-[80px] max-h-[160px] resize-y"
                    placeholder="Question text..."
                  />
                  <Button variant="ghost" size="icon" className="mt-1" onClick={() => handleQuestionDelete(question.id)}>
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
            <Button onClick={handleCreate} className="w-full" disabled={createAssignment.isPending}>
              {createAssignment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Assignment"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

