"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { api } from "~/utils/api"
import { useToast } from "~/hooks/use-toast"
import { type Question } from "@prisma/client"
import { ArrowRight, Brain, Lightbulb, Mail, MessageSquare, Mic, MicOff, Target, Timer, User } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"

type ProcessingState = 'idle' | 'transcribing' | 'analyzing' | 'complete';

const loadingMessages = {
  transcribing: [
    "Converting your speech to text...",
    "Processing audio...",
    "Transcribing your response..."
  ],
  analyzing: [
    "Analyzing your response...",
    "Generating feedback...",
    "Processing your insights..."
  ]
};

// Mock feedback data (replace with actual API response later)
const mockFeedback = {
  analysis: {
    strengths: [
      "Clear articulation of ideas",
      "Strong supporting examples",
      "Logical flow of thoughts"
    ],
    improvements: [
      "Could elaborate more on key points",
      "Consider alternative perspectives"
    ],
    summary: "Your response demonstrates a good understanding of the topic with clear examples. Consider expanding on your key points for even stronger answers."
  }
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50) // Adjust speed here (lower = faster)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <span className="min-h-[1.5rem] inline-block">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

interface StudentAssignmentViewProps {
  assignmentId: string
  assignmentName: string
  questionCount: number
  professorName: string
  courseName: string
  questions: Question[]
}

export function StudentAssignmentView({
  assignmentId,
  assignmentName,
  questionCount,
  professorName,
  courseName,
  questions,
}: StudentAssignmentViewProps) {
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [hasStarted, setHasStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  // tRPC mutations
  const createStudentAssignment = api.studentAssignment.create.useMutation({
    onSuccess: () => {
      setHasStarted(true)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const createResponse = api.studentAssignment.createResponse.useMutation({
    onSuccess: () => {
      setProcessingState('complete')
      setShowFeedback(true)
      toast({
        title: "Success",
        description: "Your response has been recorded and transcribed.",
      })
    },
    onError: (error) => {
      setProcessingState('idle')
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isRecording) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Loading messages effect
  useEffect(() => {
    let interval: number | undefined;
    if (processingState === 'transcribing' || processingState === 'analyzing') {
      interval = window.setInterval(() => {
        setLoadingMessageIndex((prev) => 
          (prev + 1) % loadingMessages[processingState].length
        );
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const studentAssignment = await createStudentAssignment.mutateAsync({
      studentName,
      studentEmail,
      assignmentId,
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Check supported MIME types
      const supportedTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp3',
      ]

      let mimeType = 'audio/webm'  // default
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          console.log('Using MIME type:', mimeType)
          break
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
      })
      
      // Clear audio chunks
      audioChunksRef.current = []
      
      // Request data every second
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log('Received audio chunk of size:', e.data.size)
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        try {
          // Get the current student assignment ID
          const studentAssignmentId = createStudentAssignment.data?.id
          if (!studentAssignmentId) {
            throw new Error('Student assignment not found')
          }

          // Get the current question ID
          const currentQuestion = questions[currentQuestionIndex]
          if (!currentQuestion) {
            throw new Error('Question not found')
          }

          // Create blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          console.log('Created audio blob with type:', mimeType, 'size:', audioBlob.size, 'from', audioChunksRef.current.length, 'chunks')
          
          if (audioBlob.size === 0) {
            throw new Error('No audio data recorded')
          }

          // Convert blob to base64
          const base64AudioData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                // Log the first 100 characters of the base64 data to check format
                console.log('Audio data format:', reader.result.substring(0, 100))
                console.log('Total audio data length:', reader.result.length)
                resolve(reader.result)
              } else {
                reject(new Error('Failed to convert audio to base64'))
              }
            }
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(audioBlob)
          })

          setProcessingState('transcribing')

          // Create response and transcribe
          await createResponse.mutateAsync({
            questionId: currentQuestion.id,
            studentAssignmentId,
            audioData: base64AudioData,
          })
        } catch (error) {
          console.error('Error processing audio:', error)
          toast({
            title: "Error",
            description: typeof error === 'object' && error !== null && 'message' in error
              ? String(error.message)
              : "Failed to process audio response",
            variant: "destructive",
          })
          setProcessingState('idle')
        }
      }

      setMediaRecorder(recorder)
      recorder.start(1000) // Request data every second
      setIsRecording(true)
      setProcessingState('idle')
      setShowFeedback(false)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Error",
        description: "Failed to access microphone. Please ensure you have granted microphone permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setProcessingState('transcribing')
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      void startRecording()
    } else {
      stopRecording()
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setProcessingState('idle')
      setTimer(0)
      setShowFeedback(false)
      audioChunksRef.current = []
    }
  }

  if (!hasStarted) {
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
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="h-12 pl-10"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your academic email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                    className="h-12 pl-10"
                  />
                </div>
                <Button type="submit" className="h-12 w-full bg-black text-white hover:bg-gray-900">
                  Start Assignment
                  <ArrowRight className="ml-2 h-4 w-4" />
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

  const currentQuestion = questions[currentQuestionIndex]

  if (!currentQuestion) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-gray-500">No questions available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                {(isRecording || (!isRecording && timer > 0 && processingState === 'idle')) && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-mono">
                      {isRecording ? formatTime(timer) : formatTime(timer)}
                    </span>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold">
                {currentQuestion.text}
              </h1>
            </div>

            {/* Recording Section */}
            {!showFeedback && (
              <div className="flex flex-col items-center py-32 relative">
                {/* Recording Button or Processing State */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16">
                  {processingState === 'idle' && (
                    <>
                      {isRecording && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping" />
                          <div className="absolute inset-0 rounded-full bg-red-600/10 animate-pulse" />
                        </>
                      )}
                      <Button
                        onClick={toggleRecording}
                        size="lg"
                        variant={isRecording ? "destructive" : "default"}
                        className={`
                          relative w-16 h-16 rounded-full p-0 flex items-center justify-center
                          ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-900'}
                        `}
                      >
                        {isRecording ? (
                          <MicOff className="w-6 h-6" />
                        ) : (
                          <Mic className="w-6 h-6" />
                        )}
                      </Button>
                    </>
                  )}

                  {(processingState === 'transcribing' || processingState === 'analyzing') && (
                    <>
                      <div className="absolute inset-0 animate-ping rounded-full bg-gray-400 opacity-20" />
                      <div className="absolute inset-0 bg-background rounded-full shadow-lg flex items-center justify-center">
                        {processingState === 'transcribing' ? (
                          <Brain className="w-6 h-6 text-foreground" />
                        ) : (
                          <MessageSquare className="w-6 h-6 text-foreground" />
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Processing Message */}
                {(processingState === 'transcribing' || processingState === 'analyzing') && loadingMessages[processingState]?.[loadingMessageIndex] && (
                  <p className="absolute top-[calc(50%+4rem)] left-1/2 -translate-x-1/2 text-sm text-muted-foreground w-full text-center">
                    <TypewriterText text={loadingMessages[processingState][loadingMessageIndex]} />
                  </p>
                )}
              </div>
            )}

            {/* Feedback Section */}
            {showFeedback && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Key Takeaway</h3>
                      <p className="text-gray-50 leading-relaxed">
                        {mockFeedback.analysis.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insights Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths Card */}
                  <div className="bg-card border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-muted p-2 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="font-semibold">Key Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                      {mockFeedback.analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start text-muted-foreground">
                          <span className="text-muted-foreground/60 mr-2">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements Card */}
                  <div className="bg-card border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-muted p-2 rounded-lg">
                        <Target className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="font-semibold">Focus Areas</h3>
                    </div>
                    <ul className="space-y-3">
                      {mockFeedback.analysis.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start text-muted-foreground">
                          <span className="text-muted-foreground/60 mr-2">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Next Question Button */}
                {currentQuestionIndex < questions.length - 1 && (
                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={handleNextQuestion}
                      className="flex items-center justify-center space-x-2 px-6 py-3 h-auto"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 