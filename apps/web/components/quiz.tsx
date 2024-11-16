'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface QuizQuestion {
  question: string;
  answers: string[];
}

interface QuizProps {
  questions: QuizQuestion[];
  onSubmit?: () => void;
}

export default function Quiz({ questions = [
  {
    question: "What is your experience with React?",
    answers: ["A. Beginner", "B. Intermediate", "C. Advanced", "D. Expert"]
  },
  {
    question: "Which of these is not a React hook?",
    answers: ["A. useState", "B. useEffect", "C. useContext", "D. useReactState"]
  },
  // Add more questions as needed
], onSubmit, }: QuizProps) {
  // Error handling for empty questions array
  if (questions.length === 0) {
    return <div className="p-4 text-center">No questions available.</div>
  }

  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(new Array(questions.length).fill(''))

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleSubmit = () => {
    console.log('Submitted answers:', selectedAnswers)
    if (onSubmit) {
      onSubmit()
    }
    // Here you can add logic to check answers or send them to a server
  }

  return (
    <div className="p-4 mx-auto space-y-6 max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-center">Quiz</h1>
      {questions.map((q, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{q.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[index]}
              onValueChange={(value) => handleAnswerChange(index, value)}
            >
              {q.answers.map((answer, answerIndex) => (
                <div key={answerIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={answer} id={`q${index}-a${answerIndex}`} />
                  <Label htmlFor={`q${index}-a${answerIndex}`}>{answer}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center mt-6">
        <Button onClick={handleSubmit}>Submit Quiz</Button>
      </div>
    </div>
  )
}