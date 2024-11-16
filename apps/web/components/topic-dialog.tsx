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

export function TopicDialog({
  show,
  setShow,
  topic,
  carouselItems,
}: {
  topic: string;
  show: boolean
  setShow: (show: boolean) => void
  carouselItems: any
}) {
  console.log('dialog', topic)
  return (
    <Dialog open={show} onOpenChange={() => {
      setShow(false)
    }}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{topic}</DialogTitle>
          <DialogDescription>
            {topic}
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <LearnCarousel carouselItems={carouselItems} />
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
