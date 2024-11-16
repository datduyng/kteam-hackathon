
"use client"

import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { event } from '@/lib/telemetry-client';
import { toast } from "@/components/ui/use-toast";
import { useMakeCopilotReadable } from "@copilotkit/react-core";
import { MermaidWithPopup } from "@/components/MindMap";
import Quiz from "@/components/quiz";

export default function LearnPage() {


  return <>
    <main className="flex flex-col items-center">
      <div className="w-full max-w-xl">
        <h1>testing</h1>
        <MermaidWithPopup />
        <Quiz questions={[
          {
            question: "What is your experience with React?",
            answers: ["A. Beginner", "B. Intermediate", "C. Advanced", "D. Expert"]
          },
          {
            question: "Which of these is not a React hook?",
            answers: ["A. useState", "B. useEffect", "C. useContext", "D. useReactState"]
          },
          // Add more questions as needed
        ]} />
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
