import React, { useState, useEffect, useRef } from 'react';
import { Wand2, X, SendHorizontal, Loader2, Code2, Sparkles } from 'lucide-react';
import UMLService from '../../../lib/umlService';

const loadingMessages = [
  "Crafting your diagram with AI...",
  "Structuring relationships...",
  "Polishing the design...",
  "Adding finishing touches...",
  "Almost ready..."
];

const Editor = ({
  isOpen,
  onToggle,
  code,
  onChange,
  projectId,
  diagramType
}) => {
  const [lines, setLines] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    setLines(code.split('\n').map((line, i) => ({
      number: i + 1,
      content: line
    })));
  }, [code]);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggle();
      setIsAnimating(false);
    }, 300);
  };

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const autoIndent = (e) => {
    try {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cursorPosition = e.target.selectionStart;
        const currentLine = code.substring(0, cursorPosition).split('\n').pop();
        const indentation = currentLine.match(/^\s*/)[0];
        const newValue = code.substring(0, cursorPosition) + '\n' + indentation + code.substring(cursorPosition);
        onChange({ target: { value: newValue } });
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorPosition + indentation.length + 1;
        }, 0);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const cursorPosition = e.target.selectionStart;
        const newValue = code.substring(0, cursorPosition) + '    ' + code.substring(cursorPosition);
        onChange({ target: { value: newValue } });
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorPosition + 4;
        }, 0);
      }
    } catch (error) {
      console.error('Error in autoIndent:', error);
    }
  };

  const handleGenerateClick = () => {
    setIsCardOpen(true);
  };

  const handleCardClose = () => {
    setIsCardOpen(false);
    setDescription('');
  };

  const animateLoading = async () => {
    setShowLoadingScreen(true);
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowLoadingScreen(false);
  };

  const handleCardSubmit = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    try {
      const umlService = new UMLService();
      const result = await umlService.generateUMLDiagram(diagramType, description);
      
      if (result.success) {
        await animateLoading();
        onChange({ target: { value: result.code } });
      } else {
        console.error('Generation error:', result.error);
      }
      handleCardClose();
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`fixed left-0 top-20 z-40 transition-all duration-300 transform h-[calc(100vh-5rem)] 
      ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%-0rem)]'} 
      ${isAnimating ? 'pointer-events-none' : ''}`}>
      
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-16 top-2 bg-gradient-to-br from-blue-400 to-blue-600 
          backdrop-blur-sm rounded-r-2xl rounded-l-none p-2.5 shadow-lg border border-blue-300/30 
          hover:shadow-blue-400/50 transition-all duration-300 group w-16 h-16"
      >
        <div className="font-mono text-white text-sm font-medium select-none
          group-hover:scale-110 transition-transform duration-300">
          {isOpen ? '</>' : '</>'}
        </div>
      </button>
  
      {/* Main Editor Container */}
      <div className="h-full w-[80vw] md:w-[60vw] lg:w-[60vw] bg-white
        backdrop-blur-md rounded-r-2xl shadow-xl border border-blue-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-blue-200/50 bg-gradient-to-r from-blue-100 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 
                  text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-300/50 
                  active:shadow-sm transition-all duration-300 flex items-center gap-2
                  hover:-translate-y-0.5 active:translate-y-0 border border-blue-400/20"
                title="Generate diagram code from description"
              >
                <Wand2 className="w-4 h-4" />
                <span className="font-medium">Generate</span>
              </button>
            </div>
          </div>
        </div>
  
        {/* Editor Area */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col bg-white">
          <div className="flex-1 relative flex bg-white rounded-xl border border-blue-200 shadow-inner overflow-hidden">
            <div 
              ref={lineNumbersRef}
              className="p-4 text-right text-blue-400 border-r border-blue-100 select-none overflow-hidden 
                bg-white w-16"
            >
              {lines.map(line => (
                <div key={line.number} className="font-mono text-sm leading-6">
                  {line.number}
                </div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={onChange}
              onScroll={handleScroll}
              onKeyDown={autoIndent}
              className="flex-1 p-4 font-mono text-sm leading-6 text-blue-900
                bg-white resize-none focus:ring-2 ring-blue-200 
                outline-none overflow-auto"
              spellCheck="false"
              placeholder="Enter your diagram code here..."
            />
          </div>
        </div>
      </div>
  
      {/* Loading Screen */}
      {showLoadingScreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-100/95 to-blue-50/95 
          backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="max-w-md w-full p-8">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin" />
                <div className="absolute inset-2 rounded-full border-t-2 border-blue-500 animate-spin-reverse" />
                <div className="absolute inset-4 rounded-full border-t-2 border-blue-400 animate-spin-slow" />
                <Code2 className="absolute inset-6 w-12 h-12 text-blue-600 animate-pulse" />
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-semibold bg-clip-text text-transparent 
                    bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
                    AI Diagram Generation
                  </h3>
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                
                <div className="h-8">
                  {loadingMessages.map((msg, idx) => (
                    <p
                      key={idx}
                      className={`text-blue-700 transition-all duration-300 
                        ${loadingStep === idx ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}
                    >
                      {msg}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Generate Dialog */}
      {isCardOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-100/90 to-blue-50/90 
          backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg transform transition-all">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-200">
              <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between
                bg-gradient-to-r from-blue-50 to-transparent">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  Generate Diagram Code
                </h3>
                <button
                  onClick={handleCardClose}
                  className="p-2 text-blue-500 hover:text-blue-700 rounded-lg 
                    hover:bg-blue-100/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Describe your diagram
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: Create a sequence diagram showing user authentication flow with login, validation, and database interactions..."
                  className="w-full h-32 p-3 text-blue-900 placeholder-blue-300 bg-blue-50/50 
                    border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-200 
                    focus:border-blue-300 outline-none transition-all resize-none"
                />
              </div>

              <div className="px-6 py-4 bg-gradient-to-b from-white to-blue-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={handleCardClose}
                  className="px-4 py-2 text-blue-600 bg-white border border-blue-200 
                    rounded-lg hover:bg-blue-50 transition-colors shadow-sm hover:shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCardSubmit}
                  disabled={isGenerating || !description.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2
                    hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 
                    transition-all duration-200 disabled:cursor-not-allowed shadow-md
                    hover:shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;