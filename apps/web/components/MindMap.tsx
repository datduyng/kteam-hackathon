import React, { useState, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';

const MermaidWithPopup = ({
  content,
  onTopicClick,
}) => {
  const [popup, setPopup] = useState({ show: false, title: '', content: '' });

  // Memoize handleNodeClick to prevent unnecessary re-renders
  const handleNodeClick = useCallback(
    (id) => {
      console.log('Node clicked:', id);
      // setPopup({ show: true, title: id, content: 'This is a decision point.' });
      onTopicClick(id);
    },
    [onTopicClick]
  );

  // Initialize Mermaid only once
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default' });

    // Bind the node click handler to window for Mermaid to call
    window.nodeClickHandler = (id) => {
      handleNodeClick(id);
    };
  }, [handleNodeClick]);

  // Render Mermaid diagram when content changes
  useEffect(() => {
    if (content) {
      const renderMermaid = async () => {
        try {
          const { svg } = await mermaid.render('mermaid-svg', content);
          document.getElementById('mermaid-container').innerHTML = svg;

          // Add click event listeners to nodes
          const nodes = document.querySelectorAll('.mindmap-node');
          nodes.forEach((node) => {
            node.addEventListener('click', nodeClickHandler);
          });
        } catch (error) {
          console.error('Error rendering Mermaid diagram:', error);
        }
      };

      renderMermaid();

      // Cleanup function to remove event listeners
      return () => {
        const nodes = document.querySelectorAll('.mindmap-node');
        nodes.forEach((node) => {
          node.removeEventListener('click', nodeClickHandler);
        });
      };
    }
  }, [content]);

  // Ensure nodeClickHandler is accessible
  const nodeClickHandler = (e) => {
    const textNode = e.target.closest('text');
    const textContent = textNode ? textNode.textContent : '';
    window.nodeClickHandler(textContent);
  };

  return (
    <div>
      <div id="mermaid-container"></div>
      {popup.show && (
        <div className="popup">
          <h2>{popup.title}</h2>
          <p>{popup.content}</p>
        </div>
      )}
    </div>
  );
};

export { MermaidWithPopup };
