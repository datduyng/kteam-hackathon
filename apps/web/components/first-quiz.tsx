import Quiz from "./quiz"

export const FirstQuiz = ({
  onSubmit
}: {
  onSubmit: () => void
}) => {
  return <Quiz questions={[
    {
      question: "What is your experience with React?",
      answers: ["A. Beginner", "B. Intermediate", "C. Advanced", "D. Expert"]
    },
    {
      question: "Which of these is not a React hook?",
      answers: ["A. useState", "B. useEffect", "C. useContext", "D. useReactState"]
    },
  ]}
    onSubmit={onSubmit}
  />
}