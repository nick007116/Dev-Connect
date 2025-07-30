import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Grid } from 'lucide-react';

const Preview = ({ svgOutput, zoom, onZoom }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  
  // Handle zoom with wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        onZoom(zoom + delta);
      }
    };

    const el = containerRef.current;
    el?.addEventListener('wheel', handleWheel, { passive: false });
    return () => el?.removeEventListener('wheel', handleWheel);
  }, [zoom, onZoom]);

  // Handle drag functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setPosition({ x: 0, y: 0 });
    onZoom(1);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Main preview area */}
      
      <div 
        ref={containerRef}
        className={`absolute inset-0 ${showGrid ? 'bg-grid-pattern' : 'bg-white'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <div 
            className="svg-container" 
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            dangerouslySetInnerHTML={{ __html: svgOutput }} 
          />
        </div>
      </div>

       {/* Enhanced vertical toolbar with fixed width */}
       <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 
        w-[4.5rem] /* Fixed width */
bg-gradient-to-b from-blue-100 via-blue-150 to-blue-100
        backdrop-blur-md 
        rounded-2xl 
        p-4 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
        border border-white/20 
        hover:border-blue-300/30 
        transition-all duration-300">
        
        <button
          onClick={() => onZoom(zoom + 0.1)}
          className="aspect-square p-2.5 
            hover:bg-white/15 
            rounded-xl 
            transition-all duration-200 
            hover:shadow-[0_4px_12px_0_rgba(31,38,135,0.15)] 
            hover:-translate-y-0.5 
            group"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-gray-800 group-hover:text-blue-500 transition-colors" />
        </button>
        
        <div className="relative px-1.5 py-2 
          text-xs font-medium 
          text-gray-800 
          bg-white/15 
          rounded-xl 
          text-center
          min-h-[2rem]
          flex items-center justify-center
          overflow-hidden">
          <span className="relative z-10">
            {Math.round(zoom * 100)}%
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-blue-50/5 backdrop-blur-sm" />
        </div>
        
        <button
          onClick={() => onZoom(zoom - 0.1)}
          className="aspect-square p-2.5 
            hover:bg-white/15 
            rounded-xl 
            transition-all duration-200 
            hover:shadow-[0_4px_12px_0_rgba(31,38,135,0.15)] 
            hover:-translate-y-0.5 
            group"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-gray-800 group-hover:text-blue-500 transition-colors" />
        </button>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />
        
        <button
          onClick={resetView}
          className="aspect-square p-2.5 
            hover:bg-white/15 
            rounded-xl 
            transition-all duration-200 
            hover:shadow-[0_4px_12px_0_rgba(31,38,135,0.15)] 
            hover:-translate-y-0.5 
            group"
          title="Reset view"
        >
          <Maximize className="w-5 h-5 text-gray-800 group-hover:text-blue-500 transition-colors" />
        </button>
        
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`aspect-square p-2.5 
            rounded-xl 
            transition-all duration-200 
            hover:shadow-[0_4px_12px_0_rgba(31,38,135,0.15)] 
            hover:-translate-y-0.5 
            group
            ${showGrid 
              ? 'bg-white/20 shadow-[inset_0_0_12px_0_rgba(31,38,135,0.1)]' 
              : 'hover:bg-white/15'
            }`}
          title="Toggle grid"
        >
          <Grid className={`w-5 h-5 transition-colors ${
            showGrid 
              ? 'text-blue-500' 
              : 'text-gray-800 group-hover:text-blue-500'
          }`} />
        </button>
      </div>
    </div>
  );
};

export default Preview;