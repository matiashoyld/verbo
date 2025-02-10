"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

interface StudentInfoFormProps {
  assignmentId: string
  assignmentName: string
  questionCount: number
  professorName: string
  courseName: string
}

export function StudentInfoForm({
  assignmentId,
  assignmentName,
  questionCount,
  professorName,
  courseName,
}: StudentInfoFormProps) {
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store the student info in localStorage
    localStorage.setItem("studentInfo", JSON.stringify({ name: studentName, email: studentEmail }))
    router.push(`/assignments/${assignmentId}/questions`)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Dark with gradient */}
      <div className="hidden w-1/2 bg-gradient-to-br from-gray-900 to-black p-12 lg:block">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="mb-16 h-8 w-8 rounded-full bg-white" />
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">{assignmentName}</h1>
            <p className="text-xl text-gray-400">{courseName}</p>
          </div>

          <div className="space-y-12">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">Questions</p>
              <p className="text-3xl font-bold text-white">{questionCount}</p>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">Professor</p>
              <p className="text-3xl font-bold text-white">{professorName}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

            <div>
              <p className="text-sm text-gray-400">
                Please provide your name and email on the right to begin the assignment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Light */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome, student</h2>
              <p className="mt-2 text-sm text-gray-500">Please provide your information to begin the assignment</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your academic email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button type="submit" className="h-12 w-full bg-black text-white hover:bg-gray-900">
                Start Assignment
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500">
              Your information will be shared with your professor for assessment purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 