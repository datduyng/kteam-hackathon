import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LearnCarousel } from "@/pages/brainbite";
import Quiz from "./quiz";

export function TopicDialog({
  refreshQuiz,
  show,
  setShow,
  topic,
  carouselItems,
  quizQuestions,
  onSubmitQuiz,
}: {
  refreshQuiz: () => void
  topic: string;
  show: boolean
  setShow: (show: boolean) => void
  carouselItems: any
  quizQuestions: any
  onSubmitQuiz: (resolvedQA: string) => void
}) {
  console.log('dialog', topic)
  return (
    <Dialog open={show} onOpenChange={() => {
      setShow(false)
    }}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger> */}
      <DialogContent className=" max-w-4xl overflow-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{topic}</DialogTitle>
          <DialogDescription>
            {/* {topic} */}
          </DialogDescription>
        </DialogHeader>
        <LearnCarousel carouselItems={carouselItems} />
        <br />
        {
          quizQuestions && <>
            <Button variant={"outline"} onClick={() => {
              refreshQuiz();
            }}>🔄 Refresh Quiz</Button>
            <Quiz
              onSubmit={onSubmitQuiz}
              questions={quizQuestions} />
          </>
        }
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
