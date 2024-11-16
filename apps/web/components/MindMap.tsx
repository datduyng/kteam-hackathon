import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { on } from 'events';

const MermaidWithPopup = ({
  content,
  onTopicClick,
}: {
  content: string;
  onTopicClick: (topic: string) => void;
}) => {
  const [diagramDefinition, setDiagramDefinition] = useState(content);

  const [popup, setPopup] = useState({ show: false, title: '', content: '' });

  useEffect(() => {
    const run = async () => {
      // Initialize Mermaid
      mermaid.initialize({ startOnLoad: true, securityLevel: 'loose', look: 'handDrawn' });
      // Bind the node click handler to window for Mermaid to call
      window.nodeClickHandler = (id) => {
        handleNodeClick(id);
      };

      // Trigger re-rendering of Mermaid
      mermaid.contentLoaded();

      setTimeout(() => {
        // query all mindmap-node class elements to add click event
        const nodes = document.querySelectorAll('.mindmap-node');
        nodes.forEach((node) => {
          node.addEventListener('click', (e) => {
            const textNode = e.target.closest('text');
            const textContent = textNode ? textNode.textContent : '';
            window.nodeClickHandler(textContent);
          });
        });
      }, 1000);
    }
    run().then().catch(() => {

    });

  }, [diagramDefinition]);

  const handleNodeClick = (id: string) => {
    console.log('Node clicked:', id);
    setPopup({ show: true, title: id, content: 'This is a decision point.' });
    onTopicClick(id);
  };

  return (
    <div>
      <div className="mermaid">{diagramDefinition}</div>
    </div>
  );
};

export { MermaidWithPopup };
