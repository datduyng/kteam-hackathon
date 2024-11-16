
"use client"

import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { event } from '@/lib/telemetry-client';
import { toast } from "@/components/ui/use-toast";
import { useMakeCopilotReadable } from "@copilotkit/react-core";
import MermaidDiagram, { MermaidWithPopup } from "@/components/MindMap";
import Quiz from "@/components/quiz";
import { FirstQuiz } from "@/components/first-quiz";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TopicDialog } from "@/components/topic-dialog";
import { set } from "date-fns";

export default function LearnPage() {

  const [quizStep, setQuizStep] = useState(0);

  const [dialogShow, setDialogShow] = useState(false);
  const [topic, setTopic] = useState('');
  const content = `
mindmap
  root(Learning Paths)
    Programming
      Python
      JavaScript
    click Programming nodeClickHandler;
    Design
      UI/UX
      Graphic Design


`.trim();
  return <>
    <main className="flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {
          quizStep === 0 && <>
            <Label>What do you want to learn</Label>
            <Input placeholder="Enter your name" />
            <Button onClick={() => {
              setQuizStep(1);
            }}>Submit</Button>
          </>
        }

        {
          quizStep === 1 && <>
            <Button variant={"outline"} onClick={() => {
              setQuizStep(0);
            }}>
              Back
            </Button>
            <FirstQuiz onSubmit={() => {
              setQuizStep(2);

            }} />
          </>
        }

        {
          quizStep === 2 && <>
            <Button variant={"outline"} onClick={() => {
              setQuizStep(1);
            }}>
              Back
            </Button>
            <MermaidWithPopup
              content={content}
              onTopicClick={(newTopic) => {
                setDialogShow(true);
                console.log('new topic', newTopic);
                setTopic(newTopic);
              }}
            />
            <TopicDialog topic={topic} show={dialogShow} setShow={setDialogShow} />
          </>
        }

      </div>
    </main>
  </>
}

// const MermaidChart = ({ chart }) => {
//   useEffect(() => {
//     const loadMermaid = async () => {
//       if (!window.mermaid) {
//         const script = document.createElement('script');
//         script.src = 'https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.min.js';
//         script.onload = () => {
//           window.mermaid.initialize({ startOnLoad: true, security: 'loose'});
//           window.mermaid.contentLoaded();
//         };
//         document.body.appendChild(script);
//       } else {
//         window.mermaid.contentLoaded();
//       }
//     };

//     loadMermaid();
//   }, [chart]);

//   return <div className="mermaid">{chart}</div>;
// };

// const Flowchart = () => {
//   const diagram = `
//     graph TD;
//     A[Start] --> B{Decision};
//     B -->|Yes| C[Proceed];
//     B -->|No| D[Stop];
//   `;

//   return <MermaidChart chart={diagram} />;
// };
