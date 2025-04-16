import { useState, useCallback } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  logLevel: 'error',
  securityLevel: 'loose',
  flowchart: { curve: 'basis' },
  sequence: { showSequenceNumbers: true },
});

export const useDiagramRenderer = () => {
  const [svgOutput, setSvgOutput] = useState('');
  const [error, setError] = useState(null);

  const renderDiagram = useCallback(async (source) => {
    if (!source.trim()) {
      setSvgOutput('');
      setError(null);
      return;
    }

    try {
      const { svg } = await mermaid.render('graphDiv', source);
      setSvgOutput(svg);
      setError(null);
    } catch (error) {
      console.error('Failed to render diagram:', error);
      setSvgOutput('');
      setError(error.message); // Set the error message
    }
  }, []);

  return { svgOutput, renderDiagram, error };
};