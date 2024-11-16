import Quiz from "./quiz"

export const FirstQuiz = ({
  onSubmit,
  questions,
}: {
  onSubmit: (resolvedQA: string) => void
  questions: any[]
}) => {
  return <Quiz questions={questions}
    onSubmit={onSubmit}
  />
}