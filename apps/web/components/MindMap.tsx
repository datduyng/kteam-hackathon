import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';

const MermaidWithPopup = () => {
  const [diagramDefinition, setDiagramDefinition] = useState(`
    graph TD;
    A[Start] --> B{Decision};
    B -->|Yes| C[Proceed];
    B -->|No| D[Stop];

    click A nodeClickHandler;
    click B nodeClickHandler;
  `);

  const [popup, setPopup] = useState({ show: false, title: '', content: '' });

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });
    // Bind the node click handler to window for Mermaid to call
    window.nodeClickHandler = (id) => {
      handleNodeClick(id);
    };
    // Trigger re-rendering of Mermaid
    mermaid.contentLoaded();
  }, [diagramDefinition]);

  const handleNodeClick = (id) => {
    // Show popup based on node ID
    if (id === 'A') {
      setPopup({ show: true, title: 'Start Node', content: 'This is the starting point.' });
    } else if (id === 'B') {
      setPopup({ show: true, title: 'Decision Node', content: 'This is a decision point.' });
    }
  };

  const closePopup = () => {
    setPopup({ show: false, title: '', content: '' });
  };

  return (
    <div>
      <div className="mermaid">{diagramDefinition}</div>

      {popup.show && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          <h2>{popup.title}</h2>
          <p>{popup.content}</p>
          <button onClick={closePopup}>Close</button>
        </div>
      )}

      {/* Optional overlay to darken background */}
      {popup.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={closePopup}
        ></div>
      )}
    </div>
  );
};

export { MermaidWithPopup };
