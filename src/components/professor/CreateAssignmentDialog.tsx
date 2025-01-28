"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Loader2, X, Upload, File } from "lucide-react"
import { PlusCircle } from "lucide-react"

type Question = {
  id: string
  text: string
}

export function CreateAssignmentDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    // Simulate file processing and question generation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setQuestions([
      { id: "1", text: "What is the main theme of the uploaded document?" },
      { id: "2", text: "Describe the key arguments presented in the text." },
      { id: "3", text: "How does the author support their thesis?" },
      { id: "4", text: "What are the potential counterarguments to the main points?" },
      { id: "5", text: "Summarize the conclusion and its effectiveness." },
    ])
    setIsProcessing(false)
    setStep(2)
  }

  const handleQuestionEdit = (id: string, newText: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text: newText } : q)))
  }

  const handleQuestionDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleCreate = () => {
    // Here you would typically send the data to your backend
    console.log("Creating assignment:", { name, files, questions })
    setIsOpen(false)
    setStep(1)
    setName("")
    setFiles([])
    setQuestions([])
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
                    onChange={handleFileChange}
                    multiple
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
            <Button type="submit" className="w-full" disabled={isProcessing}>
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
            <div className="space-y-2">
              {questions.map((question) => (
                <div key={question.id} className="flex items-center space-x-2">
                  <Input
                    value={question.text}
                    onChange={(e) => handleQuestionEdit(question.id, e.target.value)}
                    className="flex-grow"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleQuestionDelete(question.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={handleCreate} className="w-full">
              Create Assignment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

