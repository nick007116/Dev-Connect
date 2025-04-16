import React, { useState, useEffect } from 'react';
import { DIAGRAM_TEMPLATES } from '../constants/diagramTemplates';
import { useDiagramRenderer } from '../hooks/useDiagramRenderer';
import { useHistory } from '../hooks/useHistory';
import Navbar from './Navbar';
import Editor from './Editor';
import Preview from './Preview';
import { db, doc, getDoc, updateDoc } from '../../../lib/firebase'; // Adjusted path
import MainLoader from '../../MainLoader'; // Import MainLoader

const DiagramEditor = ({ currentUser }) => {
  const queryParams = new URLSearchParams(window.location.search);
  const projectTitle = queryParams.get('title');
  const projectType = queryParams.get('type') || 'flowchart';
  const projectId = window.location.pathname.split('/').pop();

  const [diagramType, setDiagramType] = useState(projectType);
  const [code, setCode] = useState(DIAGRAM_TEMPLATES[projectType]);
  const [zoom, setZoom] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [loading, setLoading] = useState(true); // Add loading state

  const { svgOutput, renderDiagram } = useDiagramRenderer();
  const { addToHistory, undo, redo, canUndo, canRedo } = useHistory(DIAGRAM_TEMPLATES[projectType]);

  useEffect(() => {
    const fetchDiagram = async () => {
      const docRef = doc(db, 'diagrams', projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCode(data.code || DIAGRAM_TEMPLATES[projectType]);
        setDiagramType(data.type || projectType);
      }
      setLoading(false); // Set loading to false after fetching data
    };

    fetchDiagram();
  }, [projectId, projectType]);

  useEffect(() => {
    renderDiagram(code);
  }, [code, renderDiagram]);

  const handleZoom = (newZoom) => {
    setZoom(Math.min(Math.max(newZoom, 0.1), 4));
  };

  const handleCodeChange = async (newCode) => {
    setCode(newCode);
    addToHistory(newCode);

    try {
      const projectRef = doc(db, 'diagrams', projectId);
      await updateDoc(projectRef, { code: newCode });
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };

  if (loading) {
    return <MainLoader onLoadingComplete={() => setLoading(false)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
      <Navbar title={projectTitle} code={code} projectId={projectId} svgOutput={svgOutput} currentUser={currentUser} diagramType={diagramType}/>
      <div className="flex-1 flex overflow-hidden"> {/* Added overflow-hidden */}
        <Preview 
          svgOutput={svgOutput} 
          zoom={zoom}
          onZoom={handleZoom}
          className="flex-1" /* Added flex-1 */
        />
        <Editor
          isOpen={isEditorOpen}
          onToggle={() => setIsEditorOpen(!isEditorOpen)}
          code={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          diagramType={diagramType}
          onDiagramTypeChange={(newType) => {
            setDiagramType(newType);
            setCode(DIAGRAM_TEMPLATES[newType]);
          }}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          projectId={projectId}
          className="overflow-auto flex-shrink-0" /* Added overflow-auto and flex-shrink-0 */
        />
      </div>
    </div>
  );
};

export default DiagramEditor;