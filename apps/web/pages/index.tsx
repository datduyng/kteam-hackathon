
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

  const [firstQuestions, setFirstQuestions] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [topicInput, setTopicInput] = useState('');

  const [resolvedQA, setResolvedQA] = useState('');
  const [resolvedMindMap, setResolvedMindMap] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [carouselItems, setCarouselItems] = useState([]);
  const fetchCarouselItems = async (input: {
    query: string;
  }) => {
    setIsLoading(true);
    try {
      toast({
        title: "Loading topic details content...",
        duration: 3000,
      })
      const response = await fetch(`/api/build-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch carousel items');
      }
      const data = await response.json();
      setCarouselItems(data.response);
      return data.response;
    } catch (error) {
      console.error('Failed to fetch carousel items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopicQuiz = async (input: {
    topic: string;
    carouselItems: any;
  }) => {
    setIsLoading(true);
    try {
      toast({
        title: "Loading topic quiz content...",
        duration: 3000,
      })
      const prompt = `${input.topic} based on content ${JSON.stringify(input.carouselItems)}`;
      const response = await fetch(`/api/get-first-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: prompt,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch carousel items');
      }
      const data = await response.json();
      setQuizQuestions(data.response);
    } catch (error) {
      console.error('Failed to fetch carousel items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return <>
    <main className="flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {
          quizStep === 0 && <>
            <Label>What do you want to learn</Label>
            <Input placeholder="Enter your name"
              value={topicInput}
              onChange={(e) => {
                setTopicInput(e.target.value);
              }}
            />
            <Button onClick={() => {
              toast({
                title: "Personalizing your learning path...",
                duration: 3000,
              })
              fetch(`/api/get-first-quiz?q=${topicInput}`)
                .then((res) => res.json())
                .then((data) => {
                  if (data.response) {
                    setFirstQuestions(data.response);
                    setQuizStep(1);
                  }
                })
                .catch((err) => {
                  console.error(err);
                  toast({
                    title: "Error when Personalizing your learning path...",
                    duration: 3000,
                  })
                });
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
            <FirstQuiz
              questions={firstQuestions}
              onSubmit={(resolvedQA: string) => {
                console.log('Resolved QA:', resolvedQA);
                setResolvedQA(resolvedQA);
                fetch(`/api/get-mindmap?resolvedQa=${resolvedQA}`)
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.response) {
                      console.log('Resolved MindMap:\n', data.response?.trim());
                      setResolvedMindMap(data.response?.trim());
                      setQuizStep(2);
                    }
                  })
                  .catch((err) => {
                    console.error(err);
                    toast({
                      title: "Error when Personalizing your learning path...",
                      duration: 3000,
                    })
                  });
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
              content={resolvedMindMap}
              onTopicClick={async (newTopic: string) => {
                setDialogShow(true);
                setTopic(newTopic);
                setCarouselItems([]);
                setQuizQuestions([]);
                const carouselItems = await fetchCarouselItems({ query: newTopic })
                await fetchTopicQuiz({ topic: newTopic, carouselItems });
              }}
            />

            <TopicDialog
              carouselItems={carouselItems}
              quizQuestions={quizQuestions}
              topic={topic}
              refreshQuiz={() => {
                fetchTopicQuiz({ topic, carouselItems }).then().catch(console.error);
              }}
              show={dialogShow}
              setShow={setDialogShow} />
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
